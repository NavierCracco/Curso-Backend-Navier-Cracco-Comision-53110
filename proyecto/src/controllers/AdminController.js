import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";
import { io } from "../app.js";
import { CustomError } from "../utils/customError.js";
import { ERRORS } from "../utils/EErrors.js";

const productsManager = new ProductMongoDao();
const userDao = new UserMongoDao();

export class AdminController {
  static getProducts = async (req, res) => {
    try {
      const products = await productsManager.getProducts();

      products.forEach(async (product) => {
        if (product.stock > 0) {
          await productsManager.updateProduct(product._id, { status: true });
        } else {
          await productsManager.updateProduct(product._id, { status: false });
        }
        io.emit("products", await productsManager.getProducts());
      });

      let user = await userDao.getById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.render("real-time-products", { products, user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static addProduct = async (req, res) => {
    const { title, description, code, price, stock, category, thumbnail } =
      req.body;
    const status = true;
    const ownerId = req.user._id;

    try {
      if (
        !title ||
        !description ||
        !code ||
        !price ||
        !stock ||
        !category ||
        !thumbnail
      ) {
        throw new CustomError({
          name: "Bad request",
          cause: "Missing fields",
          message: "Missing fields",
          code: ERRORS["BAD REQUEST"],
        });
      }

      const product = await productsManager.addProduct({
        title,
        description,
        price,
        thumbnail,
        stock,
        code,
        category,
        status,
        owner: ownerId,
      });
      res.status(201).json({ message: "Product added:", product });
      io.emit("products", await productsManager.getProducts()); // Emitimos el evento products con los productos actualizados.
    } catch (error) {
      res.status(500).json(error.message);
    }
  };

  static renderAdminUsersPage = async (req, res) => {
    const usuario = req.user;

    try {
      const getUsers = await userDao.getAllUsers();
      if (!getUsers) return res.status(404).json({ message: "Not found" });

      const users = getUsers.filter((user) => user.role !== "admin");

      res.render("adminUsers", { users, usuario });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };
}
