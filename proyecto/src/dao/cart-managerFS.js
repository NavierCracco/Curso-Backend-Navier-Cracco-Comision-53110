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

  // Agregamos un nuevo carrito y retornamos el carrito creado.
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

  // Retornamos un array con los productos del carrito con el id especificado.
  async getCartById(cid) {
    const cart = this.carts.find((cart) => cart.id === cid);
    if (!cart) {
      throw new Error("Cart not found");
    }
    return cart.products;
  }

  // Agregamos un producto al carrito con el id especificado. Si el producto ya existe, se incrementa la cantidad. Si no existe, se agrega al carrito.
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
