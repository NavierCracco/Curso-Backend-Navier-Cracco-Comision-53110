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
  SessionController.callbackGithubRedirect
);
router.get("/errorGithub", SessionController.errorGithub);

router.get("/register", SessionController.registerRenderPage);
router.get("/login", SessionController.loginRenderPage);
router.get("/logout", ensureAuthenticated, SessionController.logoutRedirect);
router.get("/forgotpassword", (req, res) => {
  res.render("forgotPassword");
});
router.get("/resetpassword", SessionController.resetPasswordRenderPage);
