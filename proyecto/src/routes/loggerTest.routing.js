import { Router } from "express";
import { config } from "../config/config.js";

export const router = Router();

router.get("/", (req, res) => {
  req.logger.debug("Debug message");
  req.logger.http("HTTP message");
  req.logger.info("Info message");
  req.logger.warning("Warning message");
  req.logger.error("Error message");
  req.logger.fatal("Fatal message");

  req.res.json("Logs generated successfully");
});
