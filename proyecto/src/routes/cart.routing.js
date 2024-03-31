import { Router } from "express";
// import { CartManager } from "../dao/managers/cart-managerFS.js";
import { CartManagerMongo } from "../dao/managers/cartManagerMongo.js";
// import { cartsPath } from "../utils.js";

export const router = Router();
// const cartManager = new CartManager(cartsPath);
const cartManager = new CartManagerMongo();

router.get("/", async (req, res) => {
  try {
    const carts = await cartManager.getCarts();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:cartId", async (req, res) => {
  const { cartId } = req.params;
  try {
    const cart = await cartManager.getCartById(cartId);
    // console.log(cart);
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.post("/:cartId/product/:productId", async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartManager.addProductToCart(
      cartId,
      productId,
      quantity
    );
    console.log(cart);
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.post(
  "/carts/6607ae06feb283d3a93e4118/product/:productId",
  async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    console.log(quantity);
    const cartId = "6607ae06feb283d3a93e4118";

    try {
      const cart = await cartManager.addProductToCart(
        cartId,
        productId,
        quantity
      );
      res.json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  }
);

router.delete("/:cartId/product/:productId", async (req, res) => {
  const { cartId, productId } = req.params;

  try {
    const cart = await cartManager.deleteProductCart(cartId, productId);
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

// router.put("/:cartId", async (req, res) => {
//   const { cartId } = req.params;
//   const { products } = req.body;
//   console.log(products);

//   try {
//     const cart = await cartManager.updateCartProducts(cartId, products);
//     res.setHeader("Content-Type", "application/json");
//     res.json(cart);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Internal server error", error: error.message });
//   }
// });

router.put("/:cartId/product/:productId", async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartManager.updateProductQuantity(
      cartId,
      productId,
      quantity
    );
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.delete("/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    const cart = await cartManager.clearCart(cartId);
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.get("/carts/:cartId", async (req, res) => {
  const { cartId } = req.params;
  try {
    const cart = await cartManager.getCartById(cartId);
    res.render("cart", { cart });
  } catch (error) {
    res.status(500).render({ error: "Error loading cart" });
  }
});

// Ruta POST para crear un nuevo carrito, FS
// router.post("/", async (req, res) => {
//   try {
//     const newCart = await cartManager.addCart();
//     res.status(201).json(newCart);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Ruta GET para listar los productos en un carrito
// router.get("/:cid", async (req, res) => {
//   const cid = req.params.cid;
//   try {
//     const products = await cartManager.getCartById(cid);
//     res.json({ products });
//   } catch (error) {
//     res.status(400).json({ error: "Cart invalid ID" });
//   }
// });

// // Ruta POST para agregar un producto al carrito
// router.post("/:cid/product/:pid", async (req, res) => {
//   const cid = req.params.cid;
//   const pid = req.params.pid;
//   const { quantity } = req.body;

//   try {
//    const cart = await cartManager.addProductToCart(cid, pid, quantity);
//     res.status(201).json(cart);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
