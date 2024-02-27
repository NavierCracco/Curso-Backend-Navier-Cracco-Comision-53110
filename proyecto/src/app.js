// Importamos express y nuestro productManager
import express from "express";
import productRouter from "../routes/products.routing.js";
import cartRouter from "../routes/cart.routing.js";

const app = express(); // creamos la app de express
app.use(express.json()); // usamos el middleware json de express

app.use("/api/products", productRouter); // usamos el router de productos en la ruta /api/products
app.use("/api/carts", cartRouter); // usamos el router de carritos en la ruta /api/carts

// Iniciamos el servidor en el puerto 8080 o el puerto asignado por el entorno (si existe)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
