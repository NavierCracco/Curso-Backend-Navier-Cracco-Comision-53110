import mongoose from "mongoose";
import { Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    purchaser: {
      type: String,
      required: true,
    },
    payment_made: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
