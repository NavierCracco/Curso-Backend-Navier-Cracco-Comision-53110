import { CartMongoDao } from "../dao/CartMongoDAO.js";

const cartManager = new CartMongoDao();

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
      res.json(carts);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  /// **** GET CART BY ID **** ///

  static getCartById = async (req, res) => {
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
  };

  /// **** ADD PRODUCT TO CART **** ///

  static addProductToCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    if (!cartId || !productId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

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
  };

  /// **** UPDATE PRODUCT QUANTITY **** ///

  static updateProductQuantity = async (req, res) => {
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
  };

  /// **** DELETE PRODUCT FROM CART **** ///

  static deleteProductCart = async (req, res) => {
    const { cartId, productId } = req.params;

    try {
      const cart = await cartManager.deleteProductCart(cartId, productId);
      res.json(cart);
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
      const cart = await cartManager.clearCart(cartId);
      res.json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };
}
