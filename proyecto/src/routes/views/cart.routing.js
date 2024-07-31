import { Router } from "express";
import { CartController } from "../../controllers/CartController.js";
import { ensureAuthenticated } from "../../middlewares/auth.js";

export const router = Router();

router.get(
  "/:cartId",
  ensureAuthenticated,
  CartController.getCartByIdRenderPage
);

router.get(
  "/:cartId/purchase/:ticketId",
  ensureAuthenticated,
  CartController.showPurchaseTicket
);
