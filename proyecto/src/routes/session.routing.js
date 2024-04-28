import { Router } from "express";
import { User } from "../dao/models/user.model.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ensureAuthenticated } from "../middlewares/auth.js";
dotenv.config();

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
      let token = jwt.sign({ user }, process.env.COOKIE_SECRET, {
        expiresIn: "24h",
      });
      // console.log(token);
      res.cookie(process.env.COOKIE_SECRET, token, {
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

router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password, role } = req.body;

  if (!first_name || !last_name || !email || !age || !password) {
    return res.status(400).json({ error: "Missing data" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    first_name,
    last_name,
    email,
    age,
    password: hashedPassword,
    role,
  });
  // console.log(user);
  await user.save();

  const token = jwt.sign({ user }, process.env.COOKIE_SECRET, {
    expiresIn: "24h",
  });
  // console.log(token);

  res.cookie(process.env.COOKIE_SECRET, token, {
    httpOnly: true,
    signed: true,
  });
  res.redirect("/api/sessions/login");
});

// router.get("/errorRegister", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: "Internal server error",
//     detalle: "Error en el proceso de registro",
//   });
// });

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  user = {
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  delete user.password;

  const token = jwt.sign({ user }, process.env.COOKIE_SECRET, {
    expiresIn: "24h",
  });
  res.cookie(process.env.COOKIE_SECRET, token, {
    httpOnly: true,
    signed: true,
  });
  res.status(200).json({ userLogued: user });
});

// router.get("/errorLogin", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   return res.status(400).json({
//     error: "Internal server error",
//     detalle: "Error en el proceso de inicio de sesión",
//   });
// });

router.get("/logout", ensureAuthenticated, (req, res) => {
  try {
    if (req.user) {
      res.clearCookie(process.env.COOKIE_SECRET);
      res.redirect("/api/sessions/login");
    }
  } catch (error) {
    res.status(500).json("Error al cerrar sesión");
  }
});

router.get("/current", ensureAuthenticated, (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(req.user);
});
