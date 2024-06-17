import { Router } from "express";
import { ensureAuthenticated, ensureAccess } from "../middlewares/auth.js";
import { ProductController } from "../controllers/ProductController.js";

export const router = Router();

router.get(
  "/",
  ensureAuthenticated,
  ensureAccess(["public"]),
  ProductController.home
);
router.get(
  "/products",
  ensureAuthenticated,
  ensureAccess(["usuario", "premium", "admin"]),
  // passport.authenticate("github", { session: false }),
  ProductController.products
);
router.post(
  "/",
  ensureAuthenticated,
  ensureAccess(["premium", "admin"]),
  ProductController.addProduct
);
router.put(
  "/:pid",
  ensureAuthenticated,
  ensureAccess(["premium", "admin"]),
  ProductController.updateProduct
);
router.delete(
  "/:pid",
  ensureAuthenticated,
  ensureAccess(["premium", "admin"]),
  ProductController.deleteProduct
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
