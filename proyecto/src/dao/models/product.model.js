import mongoose from "mongoose";
import { Schema } from "mongoose";
import moongosePaginate from "mongoose-paginate-v2";

const productSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    code: { type: String },
    price: { type: Number },
    status: { type: Boolean },
    stock: { type: Number },
    category: { type: String },
    thumbnail: { type: String },
    quantity: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(moongosePaginate);
export const Product = mongoose.model("Product", productSchema);
