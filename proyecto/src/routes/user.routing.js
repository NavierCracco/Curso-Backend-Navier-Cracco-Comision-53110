import { Router } from "express";
import { User } from "../dao/models/user.model.js";
import { Cart } from "../dao/models/cart.model.js";

export const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email } = req.body;

    // if (email === User.find({ email: email })) {
    //   console.log(`Email: ${email}, already exists`);
    //   return res.status(400).json({ error: "User already exists" });
    // }

    const user = await User.create({ username, email });
    await Cart.create({ products: [] });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
