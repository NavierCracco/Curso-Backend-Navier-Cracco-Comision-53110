import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageCollection = "messages";
const messageSchema = new Schema({
  user: String,
  message: String,
});

export const Messages = mongoose.model(messageCollection, messageSchema);
