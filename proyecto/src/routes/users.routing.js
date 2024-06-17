import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

export const router = Router();

router.put("/premium/:uid", UserController.updateRole);
