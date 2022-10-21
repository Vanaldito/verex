import fs from "fs";
import { spawn } from "child_process";
import { build } from "esbuild";

import { getConfig } from "./config.js";

export function runBuild() {
  const config = getConfig();

  const serverFile = config.serverFile;

  console.log("Building...");

  build({
    entryPoints: [serverFile],
    outdir: "dist",
    allowOverwrite: true,
    format: "cjs",
    platform: "node",
    define: {
      "process.env.STEK_ENV": '"production"',
      "process.env.STEK_HTML_PATH": '"static/index.html"',
    },
    minify: true,
    bundle: true,
  }).then(() => {
    if (fs.existsSync("dist/static")) {
      fs.rmSync("dist/static", { recursive: true, force: true });
    }

    fs.mkdirSync("dist/static");

    runCommand("cd client && yarn build");
    runCommand("mv client/dist/* dist/static");
  });
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", command], { stdio: "inherit" });
    child.on("close", (code) => {
      if (code !== 0) {
        reject({ command });
        return;
      }
      resolve();
    });
  });
}
