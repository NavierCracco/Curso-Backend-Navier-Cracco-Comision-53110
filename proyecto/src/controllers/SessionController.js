import { UserMongoDao as UserDao } from "../dao/UserMongoDAO.js";
import { CartMongoDao as CartDao } from "../dao/CartMongoDAO.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userDao = new UserDao();
const cartDao = new CartDao();

export class SessionController {
  static register = async (req, res) => {
    const { first_name, last_name, email, age, password, role } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: "Missing data" });
    }

    let existingUser = await userDao.getAll({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let cart = await cartDao.createCart({ products: [] });

    let user = await userDao.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role,
      cart: cart._id,
    });
    await user.save();

    const token = jwt.sign({ user }, config.general.COOKIE_SECRET, {
      expiresIn: "24h",
    });
    // console.log(token);

    res.cookie(config.general.COOKIE_SECRET, token, {
      httpOnly: true,
      signed: true,
    });
    res.redirect("/api/sessions/login");
  };

  /// ****  LOGIN  **** ///

  static login = async (req, res) => {
    const { email, password } = req.body;
    let user = await userDao.getAll({ email });
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

    const token = jwt.sign({ user }, config.general.COOKIE_SECRET, {
      expiresIn: "24h",
    });
    res.cookie(config.general.COOKIE_SECRET, token, {
      httpOnly: true,
      signed: true,
    });
    res.status(200).json({ userLogued: user });
  };

  /// ****  LOGOUT  **** ///

  static logout = (req, res) => {
    try {
      if (req.user) {
        res.clearCookie(config.general.COOKIE_SECRET);
        res.redirect("/api/sessions/login");
      }
    } catch (error) {
      res.status(500).json("Error al cerrar sesión");
    }
  };

  /// **** CURRENT **** ///

  static current = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(req.user);
  };
}
