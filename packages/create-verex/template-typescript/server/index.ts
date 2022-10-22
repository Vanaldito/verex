import express from "express";
import path from "path";

import apiRouter from "./src/routes/api";

const app = express();

if (process.env.VEREX_ENV === "production") {
  app.use("/", express.static(path.join(__dirname, "static")));
}

app.use("/api/v1", apiRouter);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, process.env.VEREX_HTML_PATH as string));
});

/* Add your routes here */

if (process.env.VEREX_ENV === "development") {
  const { Assets } = require("verex");
  new Assets().useRouter(app);
}

app.get("/*", (_req, res) => {
  res
    .status(404)
    .sendFile(path.join(__dirname, process.env.VEREX_HTML_PATH as string));
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log();
  console.log(`  App running in port ${PORT}`);
  console.log();
  console.log(`  > Local: \x1b[36mhttp://localhost:\x1b[1m${PORT}/\x1b[0m`);
});
