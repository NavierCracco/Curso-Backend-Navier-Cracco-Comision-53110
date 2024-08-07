import mongoose from "mongoose";
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
    }
  }

  async getProducts(options = {}) {
    try {
      return await this.Product.find(options).lean();
    } catch (error) {
      console.error("Load error the products:", error.message);
    }
  }

  async getProductByCode(code) {
    try {
      return await this.Product.findOne({ code }).lean();
    } catch (error) {
      console.error("Load error the product:", error.message);
    }
  }

  async getProductById(id) {
    try {
      return await this.Product.findById(id).lean();
    } catch (error) {
      console.error("Load error the product:", error.message);
    }
  }

  async updateProduct(id, productData) {
    try {
      return await this.Product.findByIdAndUpdate(id, productData, {
        new: true,
      });
    } catch (error) {
      console.error("Updating error the product:", error.message);
    }
  }

  async deleteProduct(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
      }

      return await this.Product.findByIdAndDelete(id);
    } catch (error) {
      console.error("Deleting error the product:", error.message);
    }
  }

  async getProductsPaginated(limit, page, sortOptions = {}) {
    try {
      const offset = (page - 1) * limit;
      return await this.Product.find(
        {},
        {},
        {
          skip: offset,
          limit: parseInt(limit),
          sort: sortOptions,
        }
      ).lean();
    } catch (error) {
      console.error("Error loading products:", error.message);
    }
  }
}
