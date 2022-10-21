import minimist from "minimist";

import { runDev } from "./run-dev.js";
import { runBuild } from "./run-build.js";

const args = minimist(process.argv.slice(2), { string: ["_"] });

if (args._.length === 0) {
  runDev();
} else {
  if (args._[0] === "build") {
    runBuild();
  }
}
