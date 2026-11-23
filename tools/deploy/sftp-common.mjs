import SftpClient from "ssh2-sftp-client";

export async function connect() {
  const host = process.env.SFTP_HOST || "www.csc.ku.ac.th";
  const port = Number(process.env.SFTP_PORT || 22);
  const username = process.env.SFTP_USER || "kaset4fair";
  const password = process.env.SFTP_PASS;

  if (!password) {
    throw new Error("Missing required environment variable: SFTP_PASS");
  }

  const sftp = new SftpClient();
  await sftp.connect({
    host,
    port,
    username,
    password,
    hostHash: "sha256",
    hostVerifier: (keyHash) => {
      console.log(`[SFTP] Host key fingerprint (sha256): ${keyHash}`);
      return true;
    },
    readyTimeout: 20000,
    keepaliveInterval: 10000,
    keepaliveCountMax: 6,
  });

  return sftp;
}

export function runExec(sshClient, command) {
  return new Promise((resolve, reject) => {
    sshClient.exec(command, (err, stream) => {
      if (err) return reject(err);
      let stdout = "";
      let stderr = "";
      stream
        .on("close", (code) => resolve({ code, stdout, stderr }))
        .on("data", (data) => {
          stdout += data.toString();
        })
        .stderr.on("data", (data) => {
          stderr += data.toString();
        });
    });
  });
}
