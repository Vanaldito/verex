import fs from "fs";
import { spawn } from "child_process";
import { build } from "esbuild";
import { NodeResolvePlugin } from "@esbuild-plugins/node-resolve";

import { getConfig } from "./config.js";

export async function runBuild() {
  const config = getConfig();

  const serverFile = config.serverFile;

  console.log("Building...");

  await build({
    entryPoints: [serverFile],
    outdir: "dist",
    allowOverwrite: true,
    format: "cjs",
    platform: "node",
    define: {
      "process.env.VEREX_ENV": '"production"',
      "process.env.VEREX_HTML_PATH": '"static/index.html"',
    },
    minify: true,
    bundle: true,
    plugins: [
      NodeResolvePlugin({
        extensions: [".ts", ".js"],
        onResolved: resolved => {
          if (resolved.includes("node_modules")) {
            return {
              external: true,
            };
          }
          return resolved;
        },
      }),
    ],
  });

  if (fs.existsSync("dist/static")) {
    fs.rmSync("dist/static", { recursive: true, force: true });
  }

  fs.mkdirSync("dist/static");

  await runCommand("cd client && yarn build");
  await runCommand("mv client/dist/* dist/static");

  const serverPkg = JSON.parse(fs.readFileSync("server/package.json", "utf-8"));
  delete serverPkg.devDependencies;
  serverPkg.name += "-build";
  serverPkg.scripts = { start: "node index.js" };
  fs.writeFileSync("dist/package.json", JSON.stringify(serverPkg, null, 2));
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn("sh", ["-c", command], { stdio: "inherit" });
    child.on("close", code => {
      if (code !== 0) {
        reject({ command });
        return;
      }
      resolve();
    });
  });
}
