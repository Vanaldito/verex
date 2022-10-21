import fs from "fs";

export function getConfig() {
  const defaultConfig = {
    serverFile: "server/index.js",
  };

  let configFile;
  try {
    configFile = fs.readFileSync(".verexrc.json");
  } catch {
    console.error("Error reading config file");
    process.exit();
  }

  let config;
  try {
    config = JSON.parse(configFile.toString() || "{}");
  } catch {
    console.error("Error parsing the config file");
    process.exit();
  }

  return {
    ...defaultConfig,
    ...config,
  };
}
