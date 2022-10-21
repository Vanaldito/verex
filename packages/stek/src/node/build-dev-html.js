import fs from "fs";
import { parse } from "node-html-parser";

export function buildDevHTMLFile() {
  let file;

  try {
    file = fs.readFileSync("client/index.html");
  } catch {
    console.error("Error reading index.html file");
    process.exit();
  }

  const root = parse(file.toString());

  const head = root.querySelector("head");
  const scripts = root.querySelectorAll("script");

  if (!head) return;

  head.innerHTML =
    `
    <script type="module">
      import RefreshRuntime from "http://localhost:3000/@react-refresh";
      RefreshRuntime.injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
      window.__vite_plugin_react_preamble_installed__ = true;
    </script>` + head.innerHTML;

  for (let script of scripts) {
    const src = script.getAttribute("src");

    if (src?.startsWith("/src")) {
      script.setAttribute("src", "http://localhost:3000" + src);
    } else if (src?.startsWith("src")) {
      script.setAttribute("src", "http://localhost:3000/" + src);
    }
  }

  fs.writeFileSync("server/static/index.html", root.toString());
}
