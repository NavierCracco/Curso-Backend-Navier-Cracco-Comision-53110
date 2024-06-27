import { CartMongoDao } from "../dao/CartMongoDAO.js";
import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";
import { Ticket } from "../dao/models/ticket.model.js";
import { ERRORS } from "../utils/EErrors.js";
import { CustomError } from "../utils/customError.js";

const cartManager = new CartMongoDao();
const productManager = new ProductMongoDao();
const userManager = new UserMongoDao();

export class CartController {
  /// **** CREATE CART  **** ///

  static createCart = async (req, res) => {
    try {
      const cart = await cartManager.createCart();
      res.json(cart);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /// **** GET ALL CARTS **** ///

  static getCarts = async (req, res) => {
    try {
      const carts = await cartManager.getCarts();
      if (!carts) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "Carts not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      res.status(200).json({ message: "carts", carts });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  /// **** GET CART BY ID **** ///

  static getCartById = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid arguments",
          message: "Cart not found",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.getCartById(cartId);
      // console.log(cart);
      res.status(200).json({ message: "cart found", cart });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  /// **** ADD PRODUCT TO CART **** ///

  static addProductToCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity, price } = req.body;

    try {
      if (!cartId || !productId) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "invalid arguments",
          code: ERRORS["NOT FOUND"],
        });
      }

      if (typeof quantity !== "number" || typeof price !== "number") {
        throw new CustomError({
          name: "Bad request",
          cause: "quantity or price are invalid",
          message: "invalid properties",
          code: ERRORS["BAD REQUEST"],
        });
      }

      const userId = req.user.user._id;
      const product = await productManager.getProductById(productId);

      if (!product.owner) {
        const cart = await cartManager.addProductToCart(
          cartId,
          productId,
          quantity,
          price
        );

        res.status(200).json({ message: "Product added", cart });
      } else if (userId.toString() !== product.owner.toString()) {
        const cart = await cartManager.addProductToCart(
          cartId,
          productId,
          quantity,
          price
        );

        res.json({ message: "Product added", cart });
      } else {
        res
          .status(400)
          .json({ message: "you can't add your own product to the cart" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  /// **** UPDATE PRODUCT QUANTITY **** ///

  static updateProductQuantity = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    try {
      if (!cartId || !productId) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "invalid arguments",
          code: ERRORS["NOT FOUND"],
        });
      }

      if (!quantity) {
        throw new CustomError({
          name: "Bad request",
          cause: "invalid properties",
          message: "invalid properties",
          code: ERRORS["BAD REQUEST"],
        });
      }
      const cart = await cartManager.updateProductQuantity(
        cartId,
        productId,
        quantity
      );
      res.status(200).json({ message: "Updated product quantity", cart });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  /// **** DELETE PRODUCT FROM CART **** ///

  static deleteProductCart = async (req, res) => {
    const { cartId, productId } = req.params;

    try {
      if (!cartId || !productId) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "invalid arguments",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.deleteProductCart(cartId, productId);
      res.status(200).json({ message: "product removed from cart", cart });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  /// **** CLEAR CART **** ///

  static clearCart = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid cartId",
          message: "invalid argument",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.clearCart(cartId);
      res.status(200).json({ message: "Empty cart", cart });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  /// **** FINALIZAR COMPRA **** ///

  static finalizePurchase = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid cartId",
          message: "invalid argument",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.getCartById(cartId);

      let userId = await userManager.getById(cart.userId);
      let userEmail = userId.email;
      // console.log(userEmail);

      const itemsWithStock = [];
      const itemsWithoutStock = [];

      for (let item of cart.products) {
        let product = await productManager.getProductById(item.productId._id);

        if (product && product.stock > 0) {
          product.stock -= item.quantity;

          await productManager.updateProduct(item.productId._id, product);
          itemsWithStock.push(product);
        } else {
          itemsWithoutStock.push(item.productId._id);
        }
      }

      cart.products = cart.products.filter(
        (p) => !itemsWithoutStock.includes(p.productId)
      );

      if (itemsWithoutStock.length > 0) {
        itemsWithoutStock.forEach(async (id) => {
          let product = await productManager.getProductById(id);
          itemsWithStock.push(product);
        });

        res.setHeader("Content-Type", "application/json");
        res.status(404).json({
          message: "Products without stock",
          itemsWithoutStock,
        });
      } else {
        const ticket = new Ticket({
          code: Date.now(),
          amount: cart.totalPrice,
          purchaser: userEmail,
        });
        await ticket.save();
        await cartManager.clearCart(cartId);

        res.json({
          message: "Purchase completed successfully",
          ticket,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };
}
