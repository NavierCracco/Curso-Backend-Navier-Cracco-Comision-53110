class ProductsManager {
  constructor() {
    this.products = [];
  }

  addProduct(title, description, price, thumbnail, stock) {
    // automatic codes
    let code = 1;
    if (this.products.length > 0) {
      code = this.products[this.products.length - 1].code + 1;
    }

    // validations
    const existingProduct = this.products.find(
      (product) => product.code === code
    );
    if (existingProduct) {
      console.log(`This product already exists, code: ${code}`);
      return;
    }
    if (!title || !description || !price || !thumbnail || !stock) {
      console.warn("All fields are required");
      return;
    }

    let newProduct = { code, title, description, price, thumbnail, stock };
    this.products.push(newProduct);
  }

  getProducts() {
    return this.products;
  }

  getProductById(code) {
    let product = this.products.find((product) => product.code === code);
    if (!product) {
      console.error("Product not found");
      return;
    }

    return product;
  }
}

let pm = new ProductsManager();

pm.addProduct("remera", "remera azul", 2000, "urltest/remera-azul", 10);
pm.addProduct("remera", "remera roja", 2000, "urltest/remera-roja", 10);
pm.addProduct("camisa", "camisa verde", 5000, "urltest/camisa-verde", 8);
pm.addProduct(
  "pantalon",
  "pantalon amarillo",
  3000,
  "urltest/pantalon-amarillo",
  10
);

// testing error
pm.addProduct("zapatilla", 8000, "urltest/zapatilla", 5);

console.log(pm.getProducts());
console.log(pm.getProductById(3));
