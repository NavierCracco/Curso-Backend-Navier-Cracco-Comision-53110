import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../dao/models/user.model.js";
import { Cart } from "../dao/models/cart.model.js";

export const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", async (req, res) => {
  const { username, email } = req.body;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  if (email === User.findOne({ email: email })) {
    return res.status(400).json({ error: "Email already exists" });
  }

  try {
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "usuario",
    });
    await Cart.create({ products: [] });

    await user.save();
    res.redirect("/api/users/login");

    // res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email });

  const adminUser = {
    email: "adminCoder@coder.com",
    password: "adminCod3r123",
    role: "admin",
  };

  try {
    if (email === adminUser.email && password === adminUser.password) {
      req.session.userId = {
        email: adminUser.email,
        role: adminUser.role,
      };
      console.log(req.session.userId);
      return res.redirect("/realtimeproducts");
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      user = { ...user._doc };
      delete user.password;
      req.session.userId = user._id;
      req.session.role = user.role;
      return res.redirect("/products");
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({ error: "Internal server error" });
    }

    res.clearCookie("connect.sid");
    res.redirect("/api/users/login");
  });
});
