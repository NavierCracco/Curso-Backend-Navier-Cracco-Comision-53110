const fs = require("fs"); // Importamos file system

class ProductsManager {
  constructor() {
    this.path = "./products.json"; // Definimos la ruta del archivo donde se importarán los productos
    this.loadProducts(); // Cargamos los productos al iniciar la clase
  }

  loadProducts() {
    try {
      // Intentamos leer el archivo JSON y convertirlo en un objeto JavaScript
      const data = fs.readFileSync(this.path, "utf-8");
      this.products = JSON.parse(data);
    } catch (error) {
      // Si hay algún error, inicializamos products como un arreglo vacío
      this.products = [];
    }
  }

  addProduct(title, description, price, thumbnail, stock, code) {
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
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
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

  updateProduct(id, updatedProduct) {
    // Buscamos el índice del producto a actualizar
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      // Actualizamos el producto
      this.products[index] = { ...this.products[index], ...updatedProduct };
      // Guardamos la lista actualizada en el archivo JSON
      fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
    } else {
      console.error(`No product found with id: ${id}`);
    }
  }

  deleteProduct(id) {
    // Buscamos el índice del producto a eliminar
    const index = this.products.findIndex((product) => product.id === id);
    if (index !== -1) {
      // Eliminamos el producto de la lista
      this.products.splice(index, 1);
      // Guardamos la lista actualizada en el archivo JSON
      fs.writeFileSync(this.path, JSON.stringify(this.products, null, 4));
    } else {
      console.error(`No product found with id: ${id}`);
    }
  }
}

let pm = new ProductsManager(); // Instanciamos el gestor de productos

pm.addProduct(
  "remera",
  "remera azul",
  2000,
  "urltest/remera-azul",
  10,
  "123ABC"
);
pm.addProduct(
  "remera",
  "remera roja",
  2000,
  "urltest/remera-roja",
  10,
  "123CBA"
);
pm.addProduct(
  "camisa",
  "camisa verde",
  5000,
  "urltest/camisa-verde",
  8,
  "123BCA"
);
pm.addProduct(
  "pantalon",
  "pantalon amarillo",
  3000,
  "urltest/pantalon-amarillo",
  10,
  "123ACB"
);

pm.updateProduct(1, { title: "remera oversize", price: 10000 });
pm.updateProduct(3, { price: 15000 });

pm.deleteProduct(2);

// Líneas comentadas para pruebas y depuración
// pm.addProduct("zapatilla", 8000, "urltest/zapatilla", 5);

// Descomentar las siguiente líneas para probar las funciones
// console.log(pm.getProducts());
// console.log(pm.getProductById(3));
