import { Router } from "express";
import { ProductsManager } from "../managers/products-manager.js";

const productRouter = Router();
const productManager = new ProductsManager("./data/products.json");

productRouter.get("/", async (req, res) => {
  let { limit, skip } = req.query; // extraemos los paramentros de consulta
  const products = await productManager.getProducts();

  // Aplicamos la paginación si se proporcionaron "limit" y "skip"
  if (skip && skip > 0) {
    products = products.slice(skip);
  }
  if (limit && limit > 0) {
    products = products.slice(0, limit);
  }

  res.json(products);
});

productRouter.get("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid); // extraemos el id del parámetro de la ruta
    // let valorId = parseInt(id); // convertimos el id a número entero (si es necesario)
    const productId = await productManager.getProductById(id); // intentamos obtener el producto por su id

    // Si el producto no existe, enviamos un mensaje de error con código  404
    if (!productId) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(productId); // si el producto existe, lo enviamos como respuesta
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error - 500" });
  }
});

productRouter.post("/", async (req, res) => {
  const { title, description, code, price, stock, category, thumbnail } =
    req.body;
  const status = true;

  if (isNaN(price) || isNaN(stock)) {
    return res.status(400).json({ error: "Price and stock must be numbers" });
  }

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await productManager.addProduct(
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
  } catch (error) {
    res.status(400).json({ error: "Error adding product" });
  }
});

productRouter.put("/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid, 10);
  const updatedProduct = req.body;

  const productId = await productManager.getProductById(pid);
  if (!productId) {
    res.status(400).json({ error: "Product not found" });
  }

  try {
    await productManager.updateProduct(pid, updatedProduct);
    res.json({
      message: "Product updated",
      product: { ...productId, ...updatedProduct },
    });
  } catch (error) {
    res.status(400).json({ error: "Error updating product" });
  }
});

productRouter.delete("/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid, 10);
  const productId = await productManager.getProductById(pid);

  if (!productId) {
    res.status(404).json({ error: "Product not found" });
  }

  try {
    await productManager.deleteProduct(pid);
    res.json(`Product deleted with id: ${pid}`);
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

export default productRouter;
