import { CustomError } from "../utils/customError.js";
import { Cart } from "./models/cart.model.js";

export class CartMongoDao {
  constructor() {
    this.Cart = Cart;
  }

  async createCart() {
    try {
      const newCart = new this.Cart();
      await newCart.save();
      return newCart;
    } catch (error) {
      console.error("Error creating cart:", error.message);
    }
  }

  async addProductToCart(cartId, productId, quantity, price) {
    try {
      const cart = await this.Cart.findById(cartId);

      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({
          productId,
          quantity,
        });
      }

      const subTotal = price ? price * quantity : 0;
      cart.totalPrice += subTotal;

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
    }
  }

  async getCarts() {
    try {
      return await this.Cart.find().populate("products").lean();
    } catch (error) {
      console.error("Error getting carts:", error.message);
    }
  }

  async getCartById(cartId) {
    try {
      return await this.Cart.findById(cartId)
        .populate("products.productId")
        .lean();
    } catch (error) {
      console.error("Error getting cart by id:", error.message);
    }
  }

  async updateCart(cartId, newCart) {
    try {
      const cart = await this.Cart.findByIdAndUpdate(cartId, newCart, {
        new: true,
      });
      return cart;
    } catch (error) {
      console.error("Error updating cart:", error.message);
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await this.Cart.findById(cartId);

      const product = cart.products.find(
        (p) => p.productId.toString() === productId
      );

      if (product) {
        product.quantity = quantity;
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error updating product quantity:", error.message);
    }
  }

  async deleteProductCart(cartId, productId) {
    try {
      const cart = await this.Cart.findById(cartId);

      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );
      cart.products.splice(productIndex, 1);

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error deleting product from cart:", error.message);
    }
  }

  async clearCart(cartId) {
    try {
      const cart = await this.Cart.findById(cartId);

      cart.products = [];
      cart.totalPrice = 0;
      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error emptying cart:", error.message);
    }
  }

  async deleteCarts(ids) {
    try {
      const result = await this.Cart.deleteMany({ _id: { $in: ids } });
      return result;
    } catch (error) {
      console.error("Error deleting carts:", error.message);
    }
  }
}
