import fs from "fs/promises"; // Importamos file system

export class ProductsManager {
  constructor(path) {
    this.path = path; // Definimos la ruta del archivo donde se importarán los productos
    this.loadProducts(); // Cargamos los productos al iniciar la clase
  }

  async loadProducts() {
    try {
      // Intentamos leer el archivo JSON y convertirlo en un objeto JavaScript
      const data = await fs.readFile(this.path, "utf-8");
      this.products = JSON.parse(data);
      console.log(`Loaded ${this.products.length} products`);
    } catch (error) {
      // Si hay algún error, inicializamos products como un arreglo vacío
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
    // Generamos un ID automático
    let id = 1;
    if (this.products.length > 0) {
      id = this.products[this.products.length - 1].id + 1;
    }

    // Verificamos si el producto ya existe por su código
    const existingProduct = this.products.some(
      (product) => product.code === code
    );
    if (existingProduct) {
      throw new Error(`Product with same code: ${code}, already exists`);
    }

    // Creamos un nuevo producto
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
    this.products.push(newProduct); // Agregamos el nuevo producto a la lista

    // Guardamos la lista actualizada en el archivo JSON
    await fs.writeFile(this.path, JSON.stringify(this.products, null, 4));
  }

  getProducts() {
    // Retornamos todos los productos
    return this.products;
  }

  getProductById(id) {
    // Buscamos un producto por su ID
    let product = this.products.find((product) => product.id === id);
    if (!product) {
      console.error(`Product not found with id: ${id}`);
      return;
    }

    return product;
  }

  async updateProduct(id, updatedProduct) {
    // Buscamos el índice del producto a actualizar
    const index = this.products.findIndex((product) => product.id === id);

    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedProduct }; // Actualizamos el producto
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 4)); // Guardamos la lista actualizada en el archivo JSON
    } else {
      console.error(`Product not found with id: ${id}`);
    }
  }

  async deleteProduct(id) {
    // Buscamos el índice del producto a eliminar
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      this.products.splice(index, 1); // Eliminamos el producto de la lista
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 4)); // Guardamos la lista actualizada en el archivo JSON
    } else {
      console.error(`No product found with id: ${id}`);
    }
  }
}
