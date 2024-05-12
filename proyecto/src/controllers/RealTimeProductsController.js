import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";
import { io } from "../app.js";

const productsManager = new ProductMongoDao();
const userDao = new UserMongoDao();

export class RealTimeProductsController {
  static home = async (req, res) => {
    let products = await productsManager.getProducts();
    res.status(200).render("home", { products });
  };

  /// **** GET PRODUCTS **** ///

  static getProducts = async (req, res) => {
    let products = await productsManager.getProducts();

    let usuario = await userDao.getById(req.user.user._id);
    if (!usuario) {
      res.setHeader("Content-Type", "application/json");
      return res.json("User not found");
    }

    res.status(200).render("real-time-products", { products, usuario });
  };

  /// **** ADD PRODUCT **** ///

  static addProduct = async (req, res) => {
    const { title, description, code, price, stock, category, thumbnail } =
      req.body;
    const status = true;

    try {
      await productsManager.addProduct(
        title,
        description,
        price,
        thumbnail,
        stock,
        code,
        category,
        status
      );
      res.status(201).json("Product added");
      io.emit("products", await productsManager.getProducts()); // Emitimos el evento products con los productos actualizados.
    } catch (error) {
      res.status(400).json({ error: "Error adding product" });
    }
  };
}
