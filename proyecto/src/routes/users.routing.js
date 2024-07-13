import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { ensureAccess, ensureAuthenticated } from "../middlewares/auth.js";
import { upload } from "../utils/utils.js";

export const router = Router();

router.put(
  "/updateusers",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  UserController.addPropUsers
);
router.get("/:uid/documents", (req, res) => {
  res.render("uploadDocuments");
});
router.post(
  "/:uid/documents",
  ensureAuthenticated,
  upload.fields([
    { name: "profiles", maxCount: 1 },
    { name: "documents", maxCount: 1 },
    { name: "products", maxCount: 1 },
  ]),
  UserController.uploadsDocuments
);
router.put("/premium/:uid", ensureAuthenticated, UserController.updateRole);
