import { UserMongoDao as UserDao } from "../dao/UserMongoDAO.js";
import { CartMongoDao as CartDao } from "../dao/CartMongoDAO.js";
import { userService } from "../repository/usersService.js";
import { config } from "../config/config.js";
import { CustomError } from "../utils/customError.js";
import { sendMail } from "../utils/sendMail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ERRORS } from "../utils/EErrors.js";

const userDao = new UserDao();
const cartDao = new CartDao();

export class SessionController {
  static register = async (req, res) => {
    const { first_name, last_name, email, age, password, role } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      throw new CustomError({
        name: "Bad request",
        cause: "Missing fields",
        message: "Missing fields",
        code: ERRORS["BAD REQUEST"],
      });
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

    cart = await cartDao.updateCart(cart._id, {
      userId: user._id,
    });

    await cart.save();

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
      throw new CustomError({
        name: "Not Found",
        cause: "Invalid arguments",
        message: "Not found",
        code: ERRORS["NOT FOUND"],
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError({
        name: "Unauthorized",
        cause: "Invalid credentials",
        message: "Unauthorized",
        code: ERRORS["UNAUTHORIZED"],
      });
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
      res.status(500).json({ error: "Error al cerrar sesión" });
    }
  };

  /// **** CURRENT **** ///

  static current = async (req, res) => {
    // console.log(req.user.user._id);
    let user = await userService.getUserById(req.user.user._id);
    // console.log(user);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ perfil: user });
  };

  static resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
      let user = await userDao.getAll({ email });
      if (!user) {
        throw new CustomError({
          name: "Not Found",
          cause: "Invalid arguments",
          message: "User not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      delete user.password;
      let token = jwt.sign({ user }, config.general.COOKIE_SECRET, {
        expiresIn: "1h",
      });
      let url = `http://localhost:8080/api/sessions/resetpassword?token=${token}`;
      let message = `Ha solicitado recuperar tu contraseña, haga click <a href=${url}>aquí</a> para continuar. Si no fue usted, contacte con el administrador.`;

      await sendMail(email, "recuperar contraseña", message);
      res.redirect(
        "/api/sessions/forgotpassword?message=recibira un email en breves"
      );
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al enviar email", error: error.message });
    }
  };

  static updatePassword = async (req, res) => {
    const { token, password } = req.body;

    try {
      const decoded = jwt.verify(token, config.general.COOKIE_SECRET);
      const user = await userService.getUserById(decoded.user._id);

      if (!user) {
        throw new CustomError({
          name: "Not Found",
          cause: "Invalid arguments",
          message: " User not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await userDao.updatePassword(decoded.user._id, hashedPassword);

      res.redirect(
        "/api/sessions/login?message=contrasena creada exitosamente"
      );
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar la contraseña",
        error: error.message,
      });
    }
  };
}
