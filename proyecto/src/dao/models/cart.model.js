import mongoose from "mongoose";
import { Schema } from "mongoose";

const cartSchema = new Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: { type: Number },
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Cart = mongoose.model("Cart", cartSchema);
