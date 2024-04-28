import { Router } from "express";
import { ProductManagerMongo } from "../dao/managers/productsManagerMongo.js";
import { io } from "../app.js";
import { ensureAccess, ensureAuthenticated } from "../middlewares/auth.js";
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

router.get(
  "/realtimeproducts",
  ensureAuthenticated,
  ensureAccess(["admin"]),
  async (req, res) => {
    let products = await productsManager.getProducts();

    // console.log(req.user.user._id);
    let usuario = await User.findById(req.user.user._id).lean();
    if (!usuario) {
      res.setHeader("Content-Type", "application/json");
      return res.json("User not found");
    }

    res.status(200).render("real-time-products", { products, usuario });
  }
);

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
