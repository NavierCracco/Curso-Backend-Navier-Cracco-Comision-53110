import { Router } from "express";
import { ensureAuthenticated, ensureAccess } from "../../middlewares/auth.js";
import { HomeController } from "../../controllers/HomeController.js";

export const router = Router();

router.get(
  "/",
  ensureAuthenticated,
  ensureAccess(["public"]),
  HomeController.home
);
