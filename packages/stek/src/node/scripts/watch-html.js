#! /usr/bin/env node

import fs from "fs";
import { buildDevHTMLFile } from "../build-dev-html.js";

fs.watchFile("client/index.html", () => {
  buildDevHTMLFile();
});
