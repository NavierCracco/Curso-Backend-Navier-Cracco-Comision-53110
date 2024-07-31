import { Router } from "express";
import { CartController } from "../../controllers/CartController.js";
import { ensureAuthenticated, ensureAccess } from "../../middlewares/auth.js";

export const router = Router();

router.get(
  "/",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  CartController.getCarts
);
router.get("/:cartId", ensureAuthenticated, CartController.getCartById);

router.post(
  "/:cartId/product/:productId",
  ensureAuthenticated,
  CartController.addProductToCart
);
router.put(
  "/:cartId/product/:productId",
  ensureAuthenticated,
  CartController.updateProductQuantity
);
router.post(
  "/:cartId/purchase",
  ensureAuthenticated,
  CartController.finalizePurchase
);

router.post(
  "/:ticketId/finalizedpurchase",
  ensureAuthenticated,
  CartController.finalizedPurchase
);
router.delete(
  "/:cartId/product/:productId",
  ensureAuthenticated,
  CartController.deleteProductCart
);
router.delete("/:cartId", ensureAuthenticated, CartController.clearCart);
router.delete(
  "/",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  CartController.deleteCarts
);
router.delete(
  "/delete/tickets",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  CartController.deleteTickets
);
