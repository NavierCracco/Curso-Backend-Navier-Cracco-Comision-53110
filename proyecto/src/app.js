import express from "express";
import { engine } from "express-handlebars";
import __dirname, { productsPath } from "./utils.js";
import path from "path";
import { Server } from "socket.io";
import { router as productRouter } from "./routes/products.routing.js";
import { router as cartRouter } from "./routes/cart.routing.js";
import { router as viewsRouter } from "./routes/real-time-products.routing.js";
import { ProductsManager } from "./managers/products-manager.js";

const app = express(); // creamos la app de express
app.use(express.json()); // usamos el middleware json de express
app.use(express.urlencoded({ extended: true })); // usamos el middleware urlencoded de express para procesar formularios enviados por el cliente
const productsManager = new ProductsManager(productsPath);

app.use("/api/products", productRouter); // usamos el router de productos en la ruta /api/products
app.use("/api/carts", cartRouter); // usamos el router de carritos en la ruta /api/carts
app.use(express.static(path.join(__dirname, "/public"))); // usamos el middleware static de express para servir archivos estaticos en la carpeta public

app.engine("handlebars", engine()); // usamos el motor de plantillas handlebars
app.set("view engine", "handlebars"); // establecemos el motor de plantillas a utilizar
app.set("views", path.join(__dirname, "/views")); // establecemos la ruta de las vistas

app.use("/", viewsRouter);

// Iniciamos el servidor en el puerto 8080 o el puerto asignado por el entorno (si existe)
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

export const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("newProduct", async (productData) => {
    await productsManager.addProduct(
      productData.title,
      productData.description,
      productData.price,
      productData.thumbnail,
      productData.stock,
      productData.code,
      productData.category,
      productData.status
    );
    const updatedProducts = await productsManager.getProducts();
    io.emit("products", updatedProducts);
  });

  socket.on("deleteProduct", async (data) => {
    await productsManager.deleteProduct(data.id);
    io.emit("products", await productsManager.getProducts());
  });

  socket.on("requestInitialProducts", async () => {
    const products = await productsManager.getProducts();
    socket.emit("initialProducts", products);
  });
});
