import path from "path";
import concurrently from "concurrently";
import { build } from "esbuild";
import { NodeResolvePlugin } from "@esbuild-plugins/node-resolve";
import { fileURLToPath } from "url";

import { getConfig } from "./config.js";
import { buildDevHTMLFile } from "./build-dev-html.js";

export function runDev() {
  const config = getConfig();

  const serverFile = config.serverFile;
  const outfile = "server/verex.development.js";

  buildDevHTMLFile();

  build({
    entryPoints: [serverFile],
    outfile,
    allowOverwrite: true,
    format: "cjs",
    platform: "node",
    define: {
      "process.env.VEREX_ENV": '"development"',
      "process.env.VEREX_HTML_PATH": '"static/index.html"',
    },
    bundle: true,
    watch: {
      onRebuild(err) {
        if (err) console.error(err);

        setTimeout(() => {
          console.clear();
          console.log("Rebuilding...");
        }, 300);
      },
    },
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
  }).then(() => {
    console.clear();
    console.log("Watching...");

    concurrently(
      [
        {
          command: "cd client && yarn dev",
          name: "client",
          prefixColor: "red",
        },
        {
          command: `node --watch ${outfile}`,
          name: "server",
          prefixColor: "green",
        },
        {
          command: `node ${path.join(
            fileURLToPath(import.meta.url),
            "../scripts/watch-html.js"
          )}`,
        },
      ],
      {
        raw: true,
      }
    );
  });
}
