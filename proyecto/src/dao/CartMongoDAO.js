import { Cart } from "./models/cart.model.js";

export class CartMongoDao {
  constructor() {
    this.Cart = Cart;
  }

  async createCart() {
    const newCart = new this.Cart();
    await newCart.save();
    return newCart;
  }

  async addProductToCart(cartId, productId, quantity, price) {
    const cart = await this.Cart.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

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
  }

  async getCarts() {
    return await this.Cart.find().populate("products").lean();
  }

  async getCartById(cartId) {
    return await this.Cart.findById(cartId)
      .populate("products.productId")
      .lean();
  }

  async updateCart(cartId, newCart) {
    const cart = await this.Cart.findByIdAndUpdate(cartId, newCart, {
      new: true,
    });
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await this.Cart.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const product = cart.products.find(
      (p) => p.productId.toString() === productId
    );

    if (product) {
      product.quantity = quantity;
    }

    await cart.save();
    return cart;
  }

  async deleteProductCart(cartId, productId) {
    const cart = await this.Cart.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex === -1) {
      throw new Error("Product not found in cart");
    }
    cart.products.splice(productIndex, 1);

    await cart.save();
    return cart;
  }

  async clearCart(cartId) {
    const cart = await this.Cart.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
    return cart;
  }
}
