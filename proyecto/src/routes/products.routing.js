import { Router } from "express";
import { ProductManagerMongo } from "../dao/managers/productsManagerMongo.js";
import { User } from "../dao/models/user.model.js";
import { ensureAuthenticated, ensureAccess } from "../middlewares/auth.js";
import passport from "passport";
// import { ProductsManager } from "../dao/managers/products-managerFS.js";
// import { productsPath } from "../utils.js";

export const router = Router();
// const productManager = new ProductsManager(productsPath);
const productManager = new ProductManagerMongo();

router.get(
  "/",
  ensureAuthenticated,
  ensureAccess(["public"]),
  async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};

    // Aplicamos filtro por si proporciona un query
    if (query) {
      queryParams = { ...queryParams, category: query };
    }

    // Calculamos el offset para la paginacion
    const offset = (page - 1) * limit;

    try {
      // Obtenemos el total de productos para calcular el totalPages
      const totalProducts = await productManager.Product.countDocuments(
        queryParams
      );
      const totalPages = Math.ceil(totalProducts / limit);

      // Obtenemos los productos con paginacion y ordenamiento
      let products = await productManager.Product.find(
        queryParams,
        {},
        {
          skip: offset,
          limit: parseInt(limit),
          sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
        }
      ).lean();

      // Creamos la respuesta con los datos de paginacion y productos
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
  }
);

router.get(
  "/products",
  ensureAuthenticated,
  ensureAccess(["usuario", "admin"]),
  // passport.authenticate("github", { session: false }),
  async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};

    // Aplicamos filtro por si proporciona un query
    if (query) {
      queryParams = { ...queryParams, category: query };
    }
    // console.log(req.user.user._id);
    let usuario = await User.findById(req.user.user._id).lean();
    if (!usuario) {
      return res.send("User not found");
    }

    // Calculamos el offset para la paginacion
    const offset = (page - 1) * limit;

    try {
      // Obtenemos los productos con paginacion y ordenamiento
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
  }
);

// router.get("/:pid", async (req, res) => {
//   try {
//     const id = req.params.pid; // extraemos el id del parámetro de la ruta
//     const product = await productManager.getProductById(id); // intentamos obtener el producto por su id

//     // Si el producto no existe, enviamos un mensaje de error con código 404
//     if (!product) {
//       res.status(404).json({ error: "Product not found" });
//     } else {
//       res.json(product); // si el producto existe, lo enviamos como respuesta
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error - 500" });
//   }
// });

router.post("/", async (req, res) => {
  const productData = req.body;
  // const status = true;

  // if (isNaN(price) || isNaN(stock)) {
  //   return res.status(400).json({ error: "Price and stock must be numbers" });
  // }

  // if (!title || !description || !code || !price || !stock || !category) {
  //   return res.status(400).json({ error: "Missing required fields" });
  // }

  try {
    const newProduct = await productManager.addProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: "Error adding product" });
  }
});

router.put("/:pid", async (req, res) => {
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
});

router.delete("/:pid", async (req, res) => {
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
});
