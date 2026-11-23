import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connect, runExec } from "./sftp-common.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SNAPSHOT_DIR = path.join(ROOT_DIR, "_server_snapshot");

const SKIP_DIRS = new Set(["node_modules", ".git"]);
const MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024; // 200 MB

async function walkRemote(sftp, remoteDir, maxDepth = 3, depth = 0, stats = { totalBytes: 0, files: [] }) {
  const items = await sftp.list(remoteDir);
  items.sort((a, b) => a.name.localeCompare(b.name));

  for (const item of items) {
    const fullPath = remoteDir === "/" ? `/${item.name}` : `${remoteDir}/${item.name}`;
    const indent = "  ".repeat(depth + 1);

    if (item.type === "d") {
      console.log(`${indent}[DIR]  ${fullPath}/`);
      if (SKIP_DIRS.has(item.name)) {
        console.log(`${indent}       (skipped subtree)`);
        continue;
      }
      if (depth + 1 < maxDepth) {
        await walkRemote(sftp, fullPath, maxDepth, depth + 1, stats);
      }
    } else {
      console.log(`${indent}[FILE] ${fullPath} (${item.size} bytes)`);
      stats.totalBytes += Number(item.size || 0);
      stats.files.push({ path: fullPath, size: Number(item.size || 0) });
    }
  }
  return stats;
}

async function downloadTree(sftp, remoteDir, localDir) {
  fs.mkdirSync(localDir, { recursive: true });
  const items = await sftp.list(remoteDir);
  for (const item of items) {
    if (SKIP_DIRS.has(item.name)) continue;
    const remotePath = remoteDir === "/" ? `/${item.name}` : `${remoteDir}/${item.name}`;
    const localPath = path.join(localDir, item.name);
    if (item.type === "d") {
      await downloadTree(sftp, remotePath, localPath);
    } else if (item.type === "-") {
      await sftp.get(remotePath, localPath);
    }
  }
}

async function main() {
  const sftp = await connect();
  try {
    const homePath = await sftp.cwd();
    console.log(`[SFTP] Remote home path (cwd): ${homePath}`);

    const topItems = await sftp.list(homePath);
    console.log("\n=== TOP-LEVEL ENTRIES ===");
    for (const item of topItems) {
      console.log(`  ${item.type === "d" ? "[DIR] " : "[FILE]"} ${item.name} (${item.size} bytes)`);
    }

    const resolveRemote = (name) => (homePath === "/" ? `/${name}` : `${homePath}/${name}`);

    const hasApp = topItems.some((i) => i.name === "app" && i.type === "d");
    const hasData = topItems.some((i) => i.name === "data" && i.type === "d");
    const hasBackups = topItems.some((i) => i.name === "backups" && i.type === "d");

    if (!hasApp || !hasData) {
      console.error(`\n[ERROR] Missing required directories on server: hasApp=${hasApp}, hasData=${hasData}`);
      process.exitCode = 2;
      return;
    }

    const appStats = { totalBytes: 0, files: [] };
    console.log("\n=== REMOTE LISTING: app/ (max depth 3, skipping node_modules) ===");
    await walkRemote(sftp, resolveRemote("app"), 3, 0, appStats);

    const dataStats = { totalBytes: 0, files: [] };
    console.log("\n=== REMOTE LISTING: data/ (max depth 3) ===");
    await walkRemote(sftp, resolveRemote("data"), 3, 0, dataStats);

    if (hasBackups) {
      console.log("\n=== REMOTE LISTING: backups/ (list only, NOT downloaded) ===");
      await walkRemote(sftp, resolveRemote("backups"), 3, 0);
    } else {
      console.log("\n=== REMOTE LISTING: backups/ (not present) ===");
    }

    const combinedBytes = appStats.totalBytes + dataStats.totalBytes;
    console.log(
      `\n[SIZE] app + data (within listed depth, excl. node_modules): ${(combinedBytes / (1024 * 1024)).toFixed(2)} MB`
    );

    if (combinedBytes > MAX_DOWNLOAD_BYTES) {
      console.error(`[ERROR] Combined size exceeds 200 MB limit (${combinedBytes} bytes). Aborting download.`);
      process.exitCode = 3;
      return;
    }

    console.log(`\n[DOWNLOAD] Downloading app/ -> ${path.join(SNAPSHOT_DIR, "app")} ...`);
    await downloadTree(sftp, resolveRemote("app"), path.join(SNAPSHOT_DIR, "app"));
    console.log("[DOWNLOAD] app/ completed.");

    console.log(`[DOWNLOAD] Downloading data/ -> ${path.join(SNAPSHOT_DIR, "data")} ...`);
    await downloadTree(sftp, resolveRemote("data"), path.join(SNAPSHOT_DIR, "data"));
    console.log("[DOWNLOAD] data/ completed.");

    console.log("\n=== SSH EXEC CHECK ===");
    try {
      const res = await runExec(
        sftp.client,
        "node -v && npm -v && pwd && ls -la && (pm2 ls || true)"
      );
      console.log(`exit code: ${res.code}`);
      if (res.stdout) console.log("stdout:\n" + res.stdout);
      if (res.stderr) console.log("stderr:\n" + res.stderr);
    } catch (execErr) {
      console.log(`exec not available: ${execErr.message}`);
    }
  } finally {
    await sftp.end();
  }
}

main().catch((err) => {
  console.error("[SFTP ERROR]", err.message || err);
  process.exit(1);
});
