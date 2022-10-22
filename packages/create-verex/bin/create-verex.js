#! /usr/bin/env node

"use strict";

import fs from "fs";
import path from "path";
import prompts from "prompts";
import minimist from "minimist";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const args = minimist(process.argv.slice(2), { string: ["_"] });
const cwd = process.cwd();

const TEMPLATES = ["javascript", "typescript"];

const renameFiles = {
  _gitignore: ".gitignore",
};

async function init() {
  const defaultTargetDir = "express-react-app";
  let targetDir = formatTargetDir(args._[0]);

  let template = args.template || args.t;

  function getProjectName() {
    return targetDir === "." ? path.basename(path.resolve()) : targetDir;
  }

  let result = {};

  try {
    result = await prompts(
      [
        {
          type: targetDir ? null : "text",
          name: "projectName",
          message: "Project name:",
          initial: defaultTargetDir,
          onState: state => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
          name: "overwrite",
          message: () =>
            `${
              targetDir === "."
                ? "Current directory"
                : `Target directory ${targetDir}`
            } is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite } = {}) => {
            if (overwrite === false) {
              throw new Error("✖ Operation cancelled");
            }
            return null;
          },
          name: "overwriteChecker",
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : "text"),
          name: "packageName",
          message: "Package name:",
          initial: () => toValidPackageName(getProjectName()),
          validate: dir =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          type: template && TEMPLATES.includes(template) ? null : "select",
          name: "template",
          message:
            typeof template === "string" && !TEMPLATES.includes(template)
              ? `"${template}" isn't a valid template. Please choose from below:`
              : "Select a template",
          initial: 0,
          choices: TEMPLATES.map(templateName => ({ title: templateName })),
          onState: state => (template = TEMPLATES[state.value]),
        },
      ],
      {
        onCancel: () => {
          throw new Error("✖ Operation cancelled");
        },
      }
    );
  } catch (canceled) {
    console.log(canceled.message);
    return;
  }

  const { overwrite } = result;
  const packageName = result.packageName || getProjectName();

  const root = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "..",
    "..",
    `template-${template}`
  );

  function write(file, content) {
    const targetPath = renameFiles[file]
      ? path.join(root, renameFiles[file])
      : path.join(root, file);

    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  }

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter(f => f !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, "package.json"), "utf-8")
  );
  pkg.name = packageName;
  write("package.json", JSON.stringify(pkg, null, 2));

  const clientPkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, "client/package.json"), "utf-8")
  );
  clientPkg.name = `${packageName}-client`;
  write("client/package.json", JSON.stringify(clientPkg, null, 2));

  const serverPkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, "server/package.json"), "utf-8")
  );
  serverPkg.name = `${packageName}-server`;
  write("server/package.json", JSON.stringify(serverPkg, null, 2));

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  console.log(`\nInstalling packages:`);

  function runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn("sh", ["-c", command], { stdio: "inherit" });
      child.on("close", code => {
        if (code !== 0) {
          reject({
            command: `${command} ${args.join(" ")}`,
          });
          return;
        }
        resolve();
      });
    });
  }

  switch (pkgManager) {
    case "yarn":
      await runCommand(`cd ${root}/client && yarn`);
      await runCommand(`cd ${root}/server && yarn`);
      break;
    default:
      await runCommand(`cd ${root}/client && ${pkgManager} install`);
      await runCommand(`cd ${root}/server && ${pkgManager} install`);
      break;
  }

  console.log("\nNow run:");
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`);
  }

  switch (pkgManager) {
    case "yarn":
      console.log("  yarn");
      console.log("  yarn dev");
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }

  console.log();
}

function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/, "");
}

function isEmpty(path) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z0-9-~]+/g, "-");
}

function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined;

  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");

  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

init().catch(err => console.log(err));
