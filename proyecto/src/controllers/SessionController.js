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

    try {
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

      const token = jwt.sign({ ...user }, config.general.COOKIE_SECRET, {
        expiresIn: "1h",
      });

      res.cookie(config.general.COOKIE_SECRET, token, {
        httpOnly: true,
        signed: true,
      });
      res.status(201).json({ userRegistered: user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static registerRenderPage = async (req, res) => {
    res.render("register", { user });
  };

  static login = async (req, res) => {
    const { email, password } = req.body;

    try {
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

      user.last_connection = new Date();
      await userDao.update(user._id, { last_connection: user.last_connection });

      user = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        documents: user.documents,
        last_connection: user.last_connection,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      delete user.password;
      delete user.documents;

      const token = jwt.sign({ ...user }, config.general.COOKIE_SECRET, {
        expiresIn: "1h",
      });
      res.cookie(config.general.COOKIE_SECRET, token, {
        httpOnly: true,
        signed: true,
      });
      res.status(200).json({ userLogued: user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static loginRenderPage = async (req, res) => {
    res.render("login");
  };

  static logout = async (req, res) => {
    const dataUser = req.user;
    try {
      if (dataUser) {
        let user = await userDao.getAll({ email: dataUser.email });

        user.last_connection = new Date();
        await userDao.update(user._id, {
          last_connection: user.last_connection,
        });

        res.clearCookie(config.general.COOKIE_SECRET);
        res.status(200).json({ message: "User logged out successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al cerrar sesión" });
    }
  };

  static logoutRedirect = async (req, res) => {
    const dataUser = req.user;
    try {
      if (dataUser) {
        let user = await userDao.getAll({ email: dataUser.email });

        user.last_connection = new Date();
        await userDao.update(user._id, {
          last_connection: user.last_connection,
        });

        res.clearCookie(config.general.COOKIE_SECRET);
        res.redirect("/sessions/login");
      }
    } catch (error) {
      res.status(500).json({ error: "Error al cerrar sesión" });
    }
  };

  static callbackGithub = async (req, res) => {
    let dataUser = req.user;

    try {
      let user = await userDao.getAll({ email: dataUser.email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.last_connection = new Date();
      await userDao.update(user._id, { last_connection: user.last_connection });

      let cart = await cartDao.createCart({ products: [] });

      user = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
        cart: cart._id,
        documents: user.documents,
        last_connection: user.last_connection,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await userDao.update(user._id, { cart: cart._id });

      cart = await cartDao.updateCart(cart._id, {
        userId: user._id,
      });
      await cart.save();

      const token = jwt.sign({ ...user }, config.general.COOKIE_SECRET, {
        expiresIn: "1h",
      });

      res.cookie(config.general.COOKIE_SECRET, token, {
        httpOnly: true,
        signed: true,
      });

      return res
        .status(200)
        .json({ message: "User logged in successfully", user: user });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  static callbackGithubRedirect = async (req, res) => {
    res.redirect("/");
  };

  static errorGithub = (req, res) => {
    return res.status(500).json({
      error: "Internal server error",
      detalle: "Error signing in with Github",
    });
  };

  static current = async (req, res) => {
    try {
      let user = await userService.getUserById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ perfil: user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
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
      let token = jwt.sign({ ...user }, config.general.COOKIE_SECRET, {
        expiresIn: "1h",
      });
      let url = `http://localhost:8080/sessions/resetpassword?token=${token}`;
      let message = `Ha solicitado recuperar tu contraseña, haga click <a href=${url}>aquí</a> para continuar. Si no fue usted, contacte con el administrador.`;

      await sendMail(email, "recuperar contraseña", message);
      res.status(200).json({ message: "Email enviado" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al enviar email", error: error.message });
    }
  };

  static resetPasswordRenderPage = async (req, res) => {
    res.render("resetPassword");
  };

  static updatePassword = async (req, res) => {
    const { token, password } = req.body;

    try {
      const decoded = jwt.verify(token, config.general.COOKIE_SECRET);
      const user = await userService.getUserById(decoded._id);

      if (!user) {
        throw new CustomError({
          name: "Not Found",
          cause: "Invalid arguments",
          message: " User not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await userDao.updatePassword(decoded._id, hashedPassword);

      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar la contraseña",
        error: error.message,
      });
    }
  };

  static updatePasswordRedirect = async (req, res) => {
    res.redirect("/sessions/login?message=contrasena creada exitosamente");
  };
}
