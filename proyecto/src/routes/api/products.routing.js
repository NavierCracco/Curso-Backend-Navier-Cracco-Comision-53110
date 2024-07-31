import { Router } from "express";
import { ensureAuthenticated, ensureAccess } from "../../middlewares/auth.js";
import { ProductController } from "../../controllers/ProductController.js";

export const router = Router();

router.get(
  "/",
  ensureAuthenticated,
  ensureAccess(["usuario", "premium", "admin"]),
  ProductController.products
);
router.post(
  "/",
  ensureAuthenticated,
  ensureAccess(["premium", "admin"]),
  ProductController.addProduct
);
router.put(
  "/:pid",
  ensureAuthenticated,
  ensureAccess(["premium", "admin"]),
  ProductController.updateProduct
);
router.delete(
  "/:pid",
  ensureAuthenticated,
  ensureAccess(["premium", "admin"]),
  ProductController.deleteProduct
);
