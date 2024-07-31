import fs from "fs/promises";

export class CartManager {
  constructor(path) {
    this.path = path;
    this.loadCarts();
  }

  async loadCarts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      this.carts = JSON.parse(data);
    } catch (error) {
      this.carts = [];
    }
  }

  async addCart() {
    let id = Date.now();

    const newCart = {
      id: id,
      products: [],
    };

    this.carts.push(newCart);
    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 4));
    return newCart;
  }

  async getCartById(cid) {
    const cart = this.carts.find((cart) => cart.id === cid);
    if (!cart) {
      throw new Error("Cart not found");
    }
    return cart.products;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = this.carts.find((cart) => cart.id === cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const productIndex = cart.products.findIndex(
      (product) => product.id === productId
    );
    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ id: productId, quantity });
    }

    await fs.writeFile(this.path, JSON.stringify(this.carts, null, 4));
  }
}
