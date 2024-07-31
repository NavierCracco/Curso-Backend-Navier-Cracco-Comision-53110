import express from "express";
import mongoose from "mongoose";
import __dirname from "./utils/utils.js";
import path from "path";
import passport from "passport";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import { router as productApiRouter } from "./routes/api/products.routing.js";
import { router as cartApiRouter } from "./routes/api/cart.routing.js";
import { router as sessionsApiRouter } from "./routes/api/session.routing.js";
import { router as usersApiRouter } from "./routes/api/users.routing.js";
import { router as homeViewRouter } from "./routes/views/home.routing.js";
import { router as productViewRouter } from "./routes/views/products.routing.js";
import { router as cartViewRouter } from "./routes/views/cart.routing.js";
import { router as sessionsViewRouter } from "./routes/views/session.routing.js";
import { router as adminRouter } from "./routes/views/admin.routing.js";
import { router as mockingRouter } from "./routes/mock.routing.js";
import { router as loggerRouter } from "./routes/loggerTest.routing.js";
import { ProductMongoDao } from "./dao/ProductsMongoDAO.js";
import { initPassport } from "./config/passport.config.js";
import { config } from "./config/config.js";
import { handleError } from "./middlewares/handleErrors.js";
import { middlewareLogger } from "./middlewares/middlewareLogger.js";
import { developmentLogger } from "./utils/winstonConfig.js";

const app = express();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "A simple Ecommerce API",
    },
  },
  apis: [`./src/docs/*.yaml`],
};
const swaggerSpec = swaggerJSDoc(options);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.general.COOKIE_SECRET));
initPassport();
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "../public")));

const productsManager = new ProductMongoDao();

app.use(middlewareLogger);

// Routes of API
app.use("/api/products", productApiRouter);
app.use("/api/cart", cartApiRouter);
app.use("/api/sessions", sessionsApiRouter);
app.use("/api/users", usersApiRouter);

// Routes of views
app.use("/", homeViewRouter);
app.use("/products", productViewRouter);
app.use("/cart", cartViewRouter);
app.use("/sessions", sessionsViewRouter);
app.use("/admin", adminRouter);
app.use("*", (req, res) => {
  res.status(404).send({ error: "Page not found" });
});

app.use("/mockingproducts", mockingRouter);
app.use("/loggertest", loggerRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));
app.use(handleError);

const PORT = config.general.PORT;
const server = app.listen(PORT, () => {
  if (config.general.MODE !== "production") {
    developmentLogger.info(
      `Server running on port http://localhost:${PORT}/sessions/login`
    );
  }
});

export const io = new Server(server);

const connect = async () => {
  try {
    await mongoose.connect(config.db.URL);
    if (config.general.MODE !== "production") {
      developmentLogger.info("DB connected!");
    }
  } catch (error) {
    developmentLogger.error(
      "faiulure connection to DB. Detail:",
      error.message
    );
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
