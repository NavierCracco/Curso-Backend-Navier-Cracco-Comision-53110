class ProductsManager {
  constructor() {
    this.products = [];
  }

  addProduct(title, description, price, thumbnail, stock, code) {
    // automatic id´s
    let id = 1;
    if (this.products.length > 0) {
      id = this.products[this.products.length - 1].id + 1;
    }

    // validations
    const existingProduct = this.products.find((product) => product.id === id);
    if (existingProduct) {
      console.log(`This product already exists, id: ${id}`);
      return;
    }
    if (!title || !description || !price || !thumbnail || !stock || !code) {
      console.warn("All fields are required");
      return;
    }

    let newProduct = { id, title, description, price, thumbnail, stock, code };
    this.products.push(newProduct);
  }

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    let product = this.products.find((product) => product.id === id);
    if (!product) {
      console.error("Product not found");
      return;
    }

    return product;
  }
}

let pm = new ProductsManager();

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

// testing error
pm.addProduct("zapatilla", 8000, "urltest/zapatilla", 5);

console.log(pm.getProducts());
console.log(pm.getProductById(3));
