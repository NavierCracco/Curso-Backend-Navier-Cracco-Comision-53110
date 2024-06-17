import { Router } from "express";
import { SessionController } from "../controllers/SessionController.js";
import { ensureAuthenticated } from "../middlewares/auth.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/github", passport.authenticate("github", {}), (req, res) => {});

router.get(
  "/callbackGithub",
  passport.authenticate("github", {
    failureRedirect: "/api/sessions/errorGithub",
    session: false,
  }),
  (req, res) => {
    // console.log(req);
    let user = req.user;
    if (user) {
      let token = jwt.sign({ user }, config.general.COOKIE_SECRET, {
        expiresIn: "24h",
      });
      // console.log(token);
      res.cookie(config.general.COOKIE_SECRET, token, {
        httpOnly: true,
        signed: true,
      });

      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ message: "User logged in successfully", user: user });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(401)
        .json({ error: "Error al inicar sesión con Github" });
    }
  }
);

router.get("/errorGithub", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(500).json({
    error: "Internal server error",
    detalle: "Fallo al iniciar sesión con Github",
  });
});

router.post("/register", SessionController.register);
router.post("/login", SessionController.login);
router.get("/logout", ensureAuthenticated, SessionController.logout);
router.get("/current", ensureAuthenticated, SessionController.current);
router.get("/forgotpassword", (req, res) => {
  res.render("forgotPassword");
});
router.post("/resetpassword", SessionController.resetPassword);
router.get("/resetpassword", (req, res) => {
  res.render("resetPassword");
});
router.post("/createdpassword", SessionController.updatePassword);
