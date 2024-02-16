const fs = require("fs").promises; // Importamos file system

class ProductsManager {
  constructor(path) {
    this.path = path; // Definimos la ruta del archivo donde se importarán los productos
    this.loadProducts(); // Cargamos los productos al iniciar la clase
  }

  async loadProducts() {
    try {
      // Intentamos leer el archivo JSON y convertirlo en un objeto JavaScript
      const data = await fs.readFile(this.path, "utf-8");
      this.products = JSON.parse(data);
    } catch (error) {
      // Si hay algún error, inicializamos products como un arreglo vacío
      this.products = [];
    }
  }

  async addProduct(title, description, price, thumbnail, stock, code) {
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
      console.log(`This product already exists`);
      return;
    }

    // Validamos que todos los campos estén presentes
    if (!title || !description || !price || !thumbnail || !stock || !code) {
      console.warn("All fields are required");
      return;
    }

    // Creamos un nuevo producto
    let newProduct = { id, title, description, price, thumbnail, stock, code };
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
      console.error("Product not found");
      return;
    }

    return product;
  }

  async updateProduct(id, updatedProduct) {
    // Buscamos el índice del producto a actualizar
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      // Actualizamos el producto
      this.products[index] = { ...this.products[index], ...updatedProduct };
      // Guardamos la lista actualizada en el archivo JSON
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 4));
    } else {
      console.error(`No product found with id: ${id}`);
    }
  }

  async deleteProduct(id) {
    // Buscamos el índice del producto a eliminar
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      // Eliminamos el producto de la lista
      this.products.splice(index, 1);
      // Guardamos la lista actualizada en el archivo JSON
      await fs.writeFile(this.path, JSON.stringify(this.products, null, 4));
    } else {
      console.error(`No product found with id: ${id}`);
    }
  }
}

(async () => {
  let pm = new ProductsManager("./products.json"); // Instanciamos el gestor de productos
  await pm.loadProducts(); // Cargamos los productos al iniciar la clase

  await pm.addProduct(
    "camisa",
    "camisa rosa",
    2000,
    "urltest/camisa-rosa",
    10,
    "321ACB"
  );

  await pm.addProduct(
    "zapatillas",
    "zapatillas rojas",
    3000,
    "urltest/zapatillas-rojas",
    10,
    "231CBA"
  );
  console.log(await pm.getProducts());
})();
