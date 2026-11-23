import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { connect, runExec } from "./sftp-common.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const REMOTE_APP_ROOT = "/home/kaset4fair/app";

const FIXED_FILES = [
  "Dockerfile",
  "docker-compose.yml",
  "backend/package.json",
  "backend/server.js",
  "backend/exhibitions-seed.js",
];

const SKIP_FRONTEND_DIRS = new Set(["node_modules", "dist", ".git"]);

function collectFrontendFiles(dir, relBase = "frontend", out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (entry.name.includes(".bak")) continue;
    const absPath = path.join(dir, entry.name);
    const relPosix = `${relBase}/${entry.name}`;
    if (entry.isDirectory()) {
      if (SKIP_FRONTEND_DIRS.has(entry.name)) continue;
      collectFrontendFiles(absPath, relPosix, out);
    } else if (entry.isFile()) {
      out.push(relPosix);
    }
  }
  return out;
}

function buildUploadManifest() {
  const relFiles = [...FIXED_FILES];
  const frontendDir = path.join(ROOT_DIR, "frontend");
  if (fs.existsSync(frontendDir)) {
    collectFrontendFiles(frontendDir, "frontend", relFiles);
  }
  return relFiles.map((relPath) => {
    const localPath = path.join(ROOT_DIR, relPath.split("/").join(path.sep));
    const stat = fs.statSync(localPath);
    return {
      relPath,
      localPath,
      remotePath: `${REMOTE_APP_ROOT}/${relPath}`,
      size: stat.size,
    };
  });
}

function createTarGzBuffer(manifest) {
  const chunks = [];
  for (const item of manifest) {
    const data = fs.readFileSync(item.localPath);
    const header = Buffer.alloc(512, 0);
    const nameBuf = Buffer.from(item.relPath, "utf8");
    if (nameBuf.length <= 100) {
      nameBuf.copy(header, 0);
    } else {
      const slashIdx = item.relPath.lastIndexOf("/");
      const prefix = Buffer.from(item.relPath.slice(0, slashIdx), "utf8");
      const name = Buffer.from(item.relPath.slice(slashIdx + 1), "utf8");
      name.copy(header, 0, 0, 100);
      prefix.copy(header, 345, 0, 155);
    }
    header.write("0000644\0", 100, "ascii");
    header.write("0000000\0", 108, "ascii");
    header.write("0000000\0", 116, "ascii");
    header.write(data.length.toString(8).padStart(11, "0") + "\0", 124, "ascii");
    header.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, "0") + "\0", 136, "ascii");
    header.fill(0x20, 148, 156);
    header.write("0", 156, "ascii");
    header.write("ustar\0", 257, "ascii");
    header.write("00", 263, "ascii");
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += header[i];
    header.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, "ascii");
    chunks.push(header, data);
    const rem = data.length % 512;
    if (rem !== 0) chunks.push(Buffer.alloc(512 - rem, 0));
  }
  chunks.push(Buffer.alloc(1024, 0));
  return zlib.gzipSync(Buffer.concat(chunks));
}

function printExecResult(label, res) {
  console.log(`\n[EXEC: ${label}] exit code=${res.code}`);
  if (res.stdout?.trim()) console.log("stdout:\n" + res.stdout.trimEnd());
  if (res.stderr?.trim()) console.log("stderr:\n" + res.stderr.trimEnd());
}

async function main() {
  const args = process.argv.slice(2);
  const isDeploy = args.includes("--deploy");
  const mode = isDeploy ? "DEPLOY" : "DRY-RUN";
  console.log(`[sftp-push] Mode: ${mode}`);

  const manifest = buildUploadManifest();
  const totalBytes = manifest.reduce((sum, f) => sum + f.size, 0);
  console.log(`\n=== UPLOAD MANIFEST (${manifest.length} files, ${(totalBytes / (1024 * 1024)).toFixed(2)} MB) ===`);
  for (const item of manifest) {
    console.log(`  ${item.localPath} -> ${item.remotePath} (${item.size} bytes)`);
  }

  let sftp = await connect();
  try {
    if (!isDeploy) {
      const checkRes = await runExec(
        sftp.client,
        'bash -lc \'cd ~/app && docker compose version && docker ps --format "{{.Names}} {{.Status}}" && curl -s http://127.0.0.1:4001/api/health\''
      );
      printExecResult("dry-run server check", checkRes);
      if (checkRes.code !== 0) {
        process.exitCode = 1;
      }
      return;
    }

    // (a) Backup ~/app on server before overwriting
    const bakCmd = 'bash -lc \'BAK=~/app.bak-$(date +%Y%m%d-%H%M%S) && cp -a ~/app "$BAK" && echo "BACKUP_PATH=$BAK"\'';
    const bakRes = await runExec(sftp.client, bakCmd);
    printExecResult("backup ~/app", bakRes);
    if (bakRes.code !== 0) {
      throw new Error("Failed to create remote backup of ~/app before deploy.");
    }
    const match = bakRes.stdout.match(/BACKUP_PATH=(.+)/);
    const backupPath = match ? match[1].trim() : "~/app.bak-*";

    // (b) Check remote sha256 hashes so we only upload changed/new files
    const hashRes = await runExec(
      sftp.client,
      `bash -lc 'cd ~/app && find . -type f ! -path "*/node_modules/*" ! -path "./backend/public/*" -exec sha256sum {} +'`
    );
    const remoteHashes = new Map();
    if (hashRes.code === 0 && hashRes.stdout) {
      for (const line of hashRes.stdout.split(/\r?\n/)) {
        const m = line.match(/^([0-9a-f]{64})\s+\.\/(.+)$/);
        if (m) remoteHashes.set(m[2], m[1]);
      }
    }

    const toUpload = manifest.filter((item) => {
      const localHash = crypto.createHash("sha256").update(fs.readFileSync(item.localPath)).digest("hex");
      return remoteHashes.get(item.relPath) !== localHash;
    });

    if (toUpload.length === 0) {
      console.log("\n[UPLOAD] All files on server are already up to date (0 changed files).");
    } else {
      const remoteArchive = "/home/kaset4fair/_deploy_pkg.tar.gz";
      const gzBuffer = createTarGzBuffer(toUpload);
      const CHUNK_SIZE = 128 * 1024;
      const totalChunks = Math.ceil(gzBuffer.length / CHUNK_SIZE);
      await runExec(sftp.client, "rm -f /home/kaset4fair/_deploy_part_*");
      console.log(
        `\n[UPLOAD] Uploading ${toUpload.length} changed file(s) (${(gzBuffer.length / 1024).toFixed(1)} KB compressed in ${totalChunks} chunk(s)) ...`
      );

      for (let i = 0; i < totalChunks; i++) {
        const chunk = gzBuffer.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkPath = `/home/kaset4fair/_deploy_part_${String(i).padStart(3, "0")}`;
        let uploaded = false;
        for (let attempt = 1; attempt <= 10; attempt++) {
          try {
            await sftp.put(chunk, chunkPath);
            uploaded = true;
            break;
          } catch (err) {
            console.warn(
              `  [WARN] chunk ${i + 1}/${totalChunks} attempt ${attempt} failed (${err.message}); reconnecting...`
            );
            try { await sftp.end(); } catch {}
            await new Promise((r) => setTimeout(r, Math.min(attempt * 1500, 6000)));
            sftp = await connect();
          }
        }
        if (!uploaded) {
          throw new Error(`Failed to upload chunk ${i + 1}/${totalChunks} after 10 attempts.`);
        }
        process.stdout.write(`  chunk ${i + 1}/${totalChunks} (${chunk.length} bytes)\n`);
      }
      console.log("[UPLOAD] All chunks uploaded. Assembling and extracting on server...");

      const extractRes = await runExec(
        sftp.client,
        `bash -lc 'cat /home/kaset4fair/_deploy_part_* > "${remoteArchive}" && rm -f /home/kaset4fair/_deploy_part_* && tar -xzf "${remoteArchive}" -C ~/app && rm -f "${remoteArchive}"'`
      );
      printExecResult("extract archive", extractRes);
      if (extractRes.code !== 0) {
        throw new Error("Failed to extract archive on server.");
      }
    }

    // (c) Rebuild & restart Docker container
    const upRes = await runExec(sftp.client, "bash -lc 'cd ~/app && docker compose up -d --build'");
    printExecResult("docker compose up -d --build", upRes);
    if (upRes.code !== 0) {
      console.error(`\n[DEPLOY FAILED] docker compose failed! Rollback backup available at: ${backupPath}`);
      process.exitCode = 1;
      return;
    }

    // (d) Wait 5s and verify health
    console.log("\n[WAIT] Waiting 5 seconds before health check...");
    await new Promise((r) => setTimeout(r, 5000));

    const healthRes = await runExec(sftp.client, "bash -lc 'curl -s http://127.0.0.1:4001/api/health'");
    printExecResult("post-deploy health check", healthRes);

    let healthOk = false;
    try {
      const parsed = JSON.parse(healthRes.stdout);
      healthOk = parsed?.status === "ok";
    } catch {
      healthOk = /"status"\s*:\s*"ok"/.test(healthRes.stdout || "");
    }

    if (healthRes.code !== 0 || !healthOk) {
      console.error(
        `\n[WARNING] Health check did NOT return status:"ok"! You can rollback using backup: ${backupPath}`
      );
      process.exitCode = 1;
      return;
    }

    console.log(`\n[DEPLOY SUCCESS] Server healthy. Backup saved at: ${backupPath}`);
  } finally {
    await sftp.end();
  }
}

main().catch((err) => {
  console.error("[SFTP PUSH ERROR]", err.message || err);
  process.exit(1);
});
