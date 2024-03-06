import { Router } from "express";
import { ProductsManager } from "../managers/products-manager.js";
import { productsPath } from "../utils.js";
import { io } from "../app.js";

export const router = Router();
const productsManager = new ProductsManager(productsPath);

router.get("/", async (req, res) => {
  let products = await productsManager.getProducts();
  res.status(200).render("home", { products });
});

router.get("/realtimeproducts", async (req, res) => {
  let products = await productsManager.getProducts();
  res.status(200).render("real-time-products", { products });
});

router.post("/realtimeproducts", async (req, res) => {
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
});
