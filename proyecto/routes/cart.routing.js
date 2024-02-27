import { Router } from "express";
import { CartManager } from "../managers/cart-manager.js";

const cartRouter = Router();
const cartManager = new CartManager("./data/carts.json");

// Ruta POST para crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.addCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Ruta GET para listar los productos en un carrito
cartRouter.get("/:cid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  try {
    const products = await cartManager.getCartById(cid);
    res.json({ products });
  } catch (error) {
    res.status(400).json({ error: "Cart invalid ID" });
  }
});

// Ruta POST para agregar un producto al carrito
cartRouter.post("/:cid/product/:pid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const { quantity } = req.body;

  try {
    await cartManager.addProductToCart(cid, pid, quantity);
    res.status(201).json({ message: "Product added to cart" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default cartRouter;
