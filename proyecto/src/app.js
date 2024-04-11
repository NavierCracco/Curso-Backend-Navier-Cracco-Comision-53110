import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import __dirname from "./utils.js";
import path from "path";
import { Server } from "socket.io";
import { router as productRouter } from "./routes/products.routing.js";
import { router as cartRouter } from "./routes/cart.routing.js";
import { router as viewsRouter } from "./routes/real-time-products.routing.js";
import { router as userRouter } from "./routes/user.routing.js";
import { ProductManagerMongo } from "./dao/managers/productsManagerMongo.js";
// import { ProductsManager } from "./dao/managers/products-managerFS.js";
dotenv.config();

const app = express(); // creamos la app de express
app.use(express.json()); // usamos el middleware json de express
app.use(express.urlencoded({ extended: true })); // usamos el middleware urlencoded de express para procesar formularios enviados por el cliente
app.use(
  session({
    secret: "contraseñaUltraMegaSecreta",
    resave: true,
    saveUninitialized: true,
  })
); // usamos el middleware session de express para manejar sesiones de usuario
app.use(express.static(path.join(__dirname, "/public"))); // usamos el middleware static de express para servir archivos estaticos en la carpeta public

const productsManager = new ProductManagerMongo();

// app.use("/api/products", productRouter); // usamos el router de productos en la ruta /api/products
app.use("/", productRouter);
app.use("/cart", cartRouter); // usamos el router de carritos en la ruta /api/carts
app.use("/api/users", userRouter); // usamos el router de usuarios en la ruta /api/users

app.engine("handlebars", engine()); // usamos el motor de plantillas handlebars
app.set("view engine", "handlebars"); // establecemos el motor de plantillas a utilizar
app.set("views", path.join(__dirname, "/views")); // establecemos la ruta de las vistas

app.use("/", viewsRouter);

// Iniciamos el servidor en el puerto 8080 o el puerto asignado por el entorno (si existe)
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(
    `Server running on port http://localhost:${PORT}/api/users/login`
  );
});

export const io = new Server(server);

const connect = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://cracconavier:${process.env.MONGO_ATLAS_PASSWORD}@cluster0.p4qr6qc.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("DB connected!");
  } catch (error) {
    console.log("faiulure connection to DB. Detail:", error.message);
  }
};
connect();

io.on("connection", (socket) => {
  socket.on("newProduct", async (productData) => {
    await productsManager.addProduct(productData);
    const updatedProducts = await productsManager.getProducts();
    io.emit("products", updatedProducts);
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await productsManager.deleteProduct(productId);
      io.emit("products", await productsManager.getProducts());
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  });

  socket.on("requestInitialProducts", async () => {
    const products = await productsManager.getProducts();
    socket.emit("initialProducts", products);
  });
});
