import { Router } from "express";
import passport from "passport";
// import bcrypt from "bcrypt";
// import { User } from "../dao/models/user.model.js";
// import { Cart } from "../dao/models/cart.model.js";

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
    if (req.user) {
      req.session.user = req.user;
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ message: "User logged in successfully", user: req.user });
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

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/sessions/errorRegister",
  }),
  async (req, res) => {
    res.redirect("/api/sessions/login");
  }
);

router.get("/errorRegister", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(400).json({
    error: "Internal server error",
    detalle: "Error en el proceso de registro",
  });
});

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/errorLogin",
    session: false,
  }),
  async (req, res) => {
    if (req.user) {
      req.session.user = req.user;
      req.session.role = req.user.role;
      res.status(200).redirect("/api/products/products");
    } else {
      res.status(401).json({ error: "Error al iniciar sesión" });
    }
  }
);

router.get("/errorLogin", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(400).json({
    error: "Internal server error",
    detalle: "Error en el proceso de inicio de sesión",
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({ error: "Internal server error" });
    }

    res.clearCookie("connect.sid");
    res.redirect("/api/sessions/login");
  });
});
