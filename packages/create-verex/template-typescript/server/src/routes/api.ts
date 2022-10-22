import { Router } from "express";

const apiRouter = Router();

apiRouter.get("/data", (_req, res) => {
  res.json({ author: "Vanaldito" });
});

export default apiRouter;
