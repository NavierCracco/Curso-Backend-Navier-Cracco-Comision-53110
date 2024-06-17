import { Router } from "express";
import { CartController } from "../controllers/CartController.js";
import { ensureAuthenticated, ensureAccess } from "../middlewares/auth.js";

export const router = Router();

router.get("/", CartController.getCarts);
router.get("/:cartId", ensureAuthenticated, CartController.getCartById);
router.post(
  "/:cartId/product/:productId",
  ensureAuthenticated,
  CartController.addProductToCart
);
router.get("/:cartId/purchase", CartController.finalizePurchase);
router.put("/:cartId/product/:productId", CartController.updateProductQuantity);
router.delete("/:cartId/product/:productId", CartController.deleteProductCart);
router.delete("/:cartId", ensureAuthenticated, CartController.clearCart);
