import { Product } from "./models/product.model.js";

export class ProductMongoDao {
  constructor() {
    this.Product = Product;
  }

  async addProduct(productData) {
    try {
      const newProduct = new this.Product(productData);
      await newProduct.save();
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error.message);
      throw new Error("Error adding product");
    }
  }

  async getProducts() {
    try {
      return await this.Product.find({}).lean();
    } catch (error) {
      console.error("Load error the products:", error.message);
      throw new Error("Error loading products");
    }
  }

  async getProductById(id) {
    try {
      return await this.Product.findById(id).lean();
    } catch (error) {
      console.error("Load error the product:", error.message);
      throw new Error("Error loading product");
    }
  }

  async updateProduct(id, productData) {
    try {
      return await this.Product.findByIdAndUpdate(id, productData, {
        new: true,
      });
    } catch (error) {
      console.error("Updating error the product:", error.message);
      throw new Error("Error updating product");
    }
  }

  async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid product ID");
      }

      return await this.Product.findByIdAndDelete(id);
    } catch (error) {
      console.error("Deleting error the product:", error.message);
      throw new Error("Error deleting product");
    }
  }

  async getProductsPaginated(limit, page) {
    const offset = (page - 1) * limit;
    return await this.Product.find({}).limit(limit).skip(offset).lean();
  }
}
