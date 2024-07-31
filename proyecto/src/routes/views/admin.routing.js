import { Router } from "express";
import { ensureAccess, ensureAuthenticated } from "../../middlewares/auth.js";
import { AdminController } from "../../controllers/AdminController.js";

export const router = Router();

router.get(
  "/realtimeproducts",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  AdminController.getProducts
);
router.post(
  "/realtimeproducts",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  AdminController.addProduct
);
router.get(
  "/users",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  AdminController.renderAdminUsersPage
);
