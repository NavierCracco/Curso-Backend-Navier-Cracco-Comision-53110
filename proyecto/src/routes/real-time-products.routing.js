import { Router } from "express";
import { ProductManagerMongo } from "../dao/managers/productsManagerMongo.js";
import { io } from "../app.js";
import { ensureAccess } from "../middlewares/auth.js";
import { User } from "../dao/models/user.model.js";
// import { ProductsManager } from "../dao/managers/products-managerFS.js";
// import { productsPath } from "../utils.js";

export const router = Router();
// const productsManager = new ProductsManager(productsPath);
const productsManager = new ProductManagerMongo();

router.get("/", async (req, res) => {
  let products = await productsManager.getProducts();
  res.status(200).render("home", { products });
});

router.get("/realtimeproducts", ensureAccess(["admin"]), async (req, res) => {
  let products = await productsManager.getProducts();

  let usuario = await User.findById(req.session.user).lean();
  if (!usuario) {
    return res.send("User not found");
  }

  res.status(200).render("real-time-products", { products, usuario });
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
