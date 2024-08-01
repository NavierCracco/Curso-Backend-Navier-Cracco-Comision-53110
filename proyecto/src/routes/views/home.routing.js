import { Router } from "express";
import { HomeController } from "../../controllers/HomeController.js";

export const router = Router();

router.get("/", HomeController.home);
