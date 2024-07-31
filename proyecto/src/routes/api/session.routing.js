import { Router } from "express";
import { SessionController } from "../../controllers/SessionController.js";
import { ensureAuthenticated } from "../../middlewares/auth.js";
import passport from "passport";

export const router = Router();

router.get("/github", passport.authenticate("github", {}), (req, res) => {});

router.get(
  "/callbackGithub",
  passport.authenticate("github", {
    failureRedirect: "/api/sessions/errorGithub",
    session: false,
  }),
  SessionController.callbackGithub
);

router.get("/errorGithub", SessionController.errorGithub);

router.post("/register", SessionController.register);
router.post("/login", SessionController.login);
router.get("/logout", ensureAuthenticated, SessionController.logout);
router.get("/current", ensureAuthenticated, SessionController.current);
router.post("/resetpassword", SessionController.resetPassword);
router.post("/createdpassword", SessionController.updatePassword);
