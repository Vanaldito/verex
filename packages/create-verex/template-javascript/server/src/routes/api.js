const { Router } = require("express");

const apiRouter = Router();

apiRouter.get("/data", (_req, res) => {
  res.json({ author: "Vanaldito" });
});

module.exports = apiRouter;
