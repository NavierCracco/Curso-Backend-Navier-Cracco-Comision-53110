import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";

const productManager = new ProductMongoDao();
const userDao = new UserMongoDao();

export class ProductController {
  static home = async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};

    if (query) {
      queryParams = { ...queryParams, category: query };
    }
    const offset = (page - 1) * limit;

    try {
      const totalProducts = await productManager.Product.countDocuments(
        queryParams
      );
      const totalPages = Math.ceil(totalProducts / limit);

      let products = await productManager.Product.find(
        queryParams,
        {},
        {
          skip: offset,
          limit: parseInt(limit),
          sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
        }
      ).lean();

      const response = {
        status: "success",
        payload: products,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/?limit=${limit}&page=${page - 1}` : null,
        nextLink:
          page < totalPages ? `/?limit=${limit}&page=${page + 1}` : null,
      };
      // res.status(200).json(response);
      res.render("home", { products });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error - 500", error: error.message });
    }
  };

  /// **** PRODUCTS **** ///

  static products = async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};

    if (query) {
      queryParams = { ...queryParams, category: query };
    }

    let usuario = await userDao.getById(req.user.user._id);
    if (!usuario) {
      return res.send("User not found");
    }

    const offset = (page - 1) * limit;

    try {
      let products = await productManager.Product.find(
        queryParams,
        {},
        {
          skip: offset,
          limit: parseInt(limit),
          sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
        }
      ).lean();

      res.render("products", { products, usuario });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error getting products", error: error.message });
    }
  };

  /// **** ADD PRODUCT **** ///

  static addProduct = async (req, res) => {
    const productData = req.body;

    try {
      if (productData.code) {
        const product = await productManager.getProducts({
          code: productData.code,
        });
        if (product) {
          throw new Error("Product code already exists");
        }
      }
      const newProduct = await productManager.addProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ error: "Error adding product" });
    }
  };

  /// **** UPDATE PRODUCT **** ///

  static updateProduct = async (req, res) => {
    const pid = req.params.pid;
    const updatedProduct = req.body;

    try {
      const product = await productManager.getProductById(pid);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
      } else {
        const updated = await productManager.updateProduct(pid, updatedProduct);
        res.json({
          message: "Product updated",
          product: updated,
        });
      }
    } catch (error) {
      res.status(400).json({ error: "Error updating product" });
    }
  };

  /// **** DELETE PRODUCT **** ///

  static deleteProduct = async (req, res) => {
    const pid = req.params.pid;

    try {
      const product = await productManager.getProductById(pid);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
      } else {
        await productManager.deleteProduct(pid);
        res.json(`Product deleted with id: ${pid}`);
      }
    } catch (error) {
      res.status(500).json({ error: "Error deleting product" });
    }
  };
}
