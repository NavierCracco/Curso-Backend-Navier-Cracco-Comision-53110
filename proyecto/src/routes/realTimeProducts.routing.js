import { Router } from "express";
import { ensureAccess, ensureAuthenticated } from "../middlewares/auth.js";
import { RealTimeProductsController } from "../controllers/RealTimeProductsController.js";

export const router = Router();

router.get("/", RealTimeProductsController.home);

router.get(
  "/realtimeproducts",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  RealTimeProductsController.getProducts
);
router.post("/realtimeproducts", RealTimeProductsController.addProduct);
