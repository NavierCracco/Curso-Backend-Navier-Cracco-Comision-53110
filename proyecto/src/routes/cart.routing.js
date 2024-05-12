import { Router } from "express";
import { CartController } from "../controllers/CartController.js";

export const router = Router();

router.get("/", CartController.getCarts);
router.get("/:cartId", CartController.getCartById);
router.post("/:cartId/product/:productId", CartController.addProductToCart);
router.put("/:cartId/product/:productId", CartController.updateProductQuantity);
router.delete("/:cartId/product/:productId", CartController.deleteProductCart);
router.delete("/:cartId", CartController.clearCart);
