import { Router } from "express";
import { ensureAuthenticated, ensureAccess } from "../../middlewares/auth.js";
import { ProductController } from "../../controllers/ProductController.js";

export const router = Router();

router.get(
  "/",
  ensureAuthenticated,
  ensureAccess(["usuario", "premium", "admin"]),
  ProductController.productsRenderPage
);
