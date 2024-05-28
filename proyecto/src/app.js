import express from "express";
import mongoose from "mongoose";
import __dirname from "./utils/utils.js";
import path from "path";
import passport from "passport";
import cookieParser from "cookie-parser";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import { router as productRouter } from "./routes/products.routing.js";
import { router as cartRouter } from "./routes/cart.routing.js";
import { router as adminRouter } from "./routes/realTimeProducts.routing.js";
import { router as sessionsRouter } from "./routes/session.routing.js";
import { router as mockingRouter } from "./routes/mock.routing.js";
import { ProductMongoDao } from "./dao/ProductsMongoDAO.js";
import { initPassport } from "./config/passport.config.js";
import { config } from "./config/config.js";
import { handleError } from "./middlewares/handleErrors.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.general.COOKIE_SECRET));
initPassport();
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "/public")));

const productsManager = new ProductMongoDao();

app.use("/api/products", productRouter);
app.use("/cart", cartRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", adminRouter);
app.use("/mockingproducts", mockingRouter);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));
app.use(handleError);

const PORT = config.general.PORT;
const server = app.listen(PORT, () => {
  console.log(
    `Server running on port http://localhost:${PORT}/api/sessions/login`
  );
});

export const io = new Server(server);

const connect = async () => {
  try {
    await mongoose.connect(config.db.URL);
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
