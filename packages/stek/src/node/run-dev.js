import path from "path";
import concurrently from "concurrently";
import { build } from "esbuild";
import { fileURLToPath } from "url";

import { getConfig } from "./config.js";
import { buildDevHTMLFile } from "./build-dev-html.js";

export function runDev() {
  const config = getConfig();

  const serverFile = config.serverFile;
  const outfile = "server/stek.development.js";

  buildDevHTMLFile();

  build({
    entryPoints: [serverFile],
    outfile,
    allowOverwrite: true,
    format: "cjs",
    platform: "node",
    define: {
      "process.env.STEK_ENV": '"development"',
      "process.env.STEK_HTML_PATH": '"static/index.html"',
    },
    bundle: true,
    watch: {
      onRebuild(err) {
        if (err) console.error(err);

        console.clear();
        console.log("Rebuilding...");
      },
    },
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
