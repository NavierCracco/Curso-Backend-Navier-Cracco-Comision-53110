import fs from "fs/promises";

export class ProductsManager {
  constructor(path) {
    this.path = path;
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const data = await fs.readFile(this.path, "utf-8");
      this.products = JSON.parse(data);
    } catch (error) {
      this.products = [];
    }
  }

  async addProduct(
    title,
    description,
    price,
    thumbnail,
    stock,
    code,
    category,
    status
  ) {
    let id = 1;
    if (this.products.length > 0) {
      id = this.products[this.products.length - 1].id + 1;
    }

    const existingProduct = this.products.some(
      (product) => product.code === code
    );
    if (existingProduct) {
      throw Error(`Product with same code: ${code}, already exists`);
    }

    let newProduct = {
      id,
      title,
      description,
      price,
      thumbnail,
      stock,
      code,
      category,
      status,
    };
    this.products.push(newProduct);

    await fs.writeFile(this.path, JSON.stringify(this.products, null, 4));
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    let product = this.products.find((product) => product.id === id);
    if (!product) {
      console.error(`Product not found with id: ${id}`);
      return;
    }

    return product;
  }

  async updateProduct(id, updatedProduct) {
    const index = this.products.findIndex((product) => product.id === id);

    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedProduct };
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 4));
    } else {
      console.error(`Product not found with id: ${id}`);
    }
  }

  async deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 4));
    } else {
      console.error(`No product found with id: ${id}`);
    }
  }
}
