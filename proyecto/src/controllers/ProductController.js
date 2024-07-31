import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";
import { ERRORS } from "../utils/EErrors.js";
import { CustomError } from "../utils/customError.js";
import { sendMail } from "../utils/sendMail.js";

const productManager = new ProductMongoDao();
const userDao = new UserMongoDao();

export class ProductController {
  static products = async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};

    if (query) {
      queryParams = { ...queryParams, category: query };
    }

    try {
      const sortOptions = {};
      if (sort) {
        sortOptions.price = sort === "asc" ? 1 : -1;
      }

      let products = await productManager.getProductsPaginated(
        parseInt(limit),
        parseInt(page),
        sortOptions
      );

      res.status(200).json({ message: "products", products });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting products", error: error.message });
    }
  };

  static productsRenderPage = async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};
    const userId = req.user._id;

    if (query) {
      queryParams = { ...queryParams, category: query };
    }

    try {
      let user = await userDao.getById(userId);
      if (!user) {
        return res.send("User not found");
      }

      let adminUser;
      if (user.role === "admin") {
        adminUser = user.role;
      }

      const sortOptions = {};
      if (sort) {
        sortOptions.price = sort === "asc" ? 1 : -1;
      }

      let products = await productManager.getProductsPaginated(
        parseInt(limit),
        parseInt(page),
        sortOptions
      );

      res.render("products", { products, user, adminUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error getting products", error: error.message });
    }
  };

  static addProduct = async (req, res) => {
    const productData = req.body;
    const owner = req.user._id;

    if (productData.code === undefined) {
      return res.status(400).json({ error: "Product code is required" });
    }

    try {
      if (productData.code) {
        const existingProduct = await productManager.getProductByCode(
          productData.code
        );
        if (existingProduct) {
          return res.status(400).json({ error: "Product code already exists" });
        }
      }
      const newProduct = await productManager.addProduct({
        ...productData,
        owner,
      });
      res.status(201).json({ message: "Product added", newProduct });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error adding product", detalle: error.message });
    }
  };

  static updateProduct = async (req, res) => {
    const pid = req.params.pid;
    const updatedProduct = req.body;
    const userId = req.user._id;

    try {
      if (!pid) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid pid",
          message: "invalid argument",
          code: ERRORS["NOT FOUND"],
        });
      }
      const product = await productManager.getProductById(pid);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
      } else {
        const user = await userDao.getById(userId);
        if (
          user.role === "admin" ||
          product.owner.toString() == user._id.toString()
        ) {
          const updated = await productManager.updateProduct(
            pid,
            updatedProduct
          );
          res.status(200).json({
            message: "Product updated",
            product: updated,
          });
        } else {
          res.status(403).json({
            error:
              "Forbidden: You don't have permission to update this product",
          });
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating product", error: error.message });
    }
  };

  static deleteProduct = async (req, res) => {
    const pid = req.params.pid;
    const userId = req.user._id;

    try {
      if (!pid) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid pid",
          message: "invalid argument",
          code: ERRORS["NOT FOUND"],
        });
      }
      const product = await productManager.getProductById(pid);

      const ownerProduct = product.owner;
      const creatorProduct = await userDao.getById(ownerProduct);

      if (!product) {
        res.status(404).json({ error: "Product not found" });
      } else {
        const user = await userDao.getById(userId);
        if (
          product.owner.toString() === user._id.toString() ||
          user.role === "admin"
        ) {
          const deleted = await productManager.deleteProduct(pid);

          const sendEmailUserPremium = async (user) => {
            const subject = "Producto eliminado";
            const message = `<h1>Hola ${user.first_name}!</h1>
            <p>Tu producto con id: <strong>${pid}</strong> ha sido eliminado.</p>
            <p>Si crees que este es un error, ponte en contacto con nosotros.</p>`;

            await sendMail(user.email, subject, message);
          };
          sendEmailUserPremium(creatorProduct);

          res.status(200).json({
            message: "Product deleted",
            product: deleted,
          });
        } else {
          res.status(403).json({
            error:
              "Forbidden: You don't have permission to delete this product",
          });
        }
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting product", error: error.message });
    }
  };
}
