import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
    },
    last_name: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
      unique: true,
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
    },
    role: {
      type: String,
      enum: ["usuario", "premium", "admin"],
      default: "usuario",
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    documents: [
      {
        name: String,
        reference: String,
      },
    ],
    last_connection: Date,
  },
  { timestamps: true, strict: false }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });
export const User = mongoose.model("User", UserSchema);
