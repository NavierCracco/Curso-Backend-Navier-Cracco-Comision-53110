import { Messages } from "../models/chat.model.js";

export class MessageManagerMongo {
  constructor() {
    this.Messages = Messages;
  }

  async addMessages(messageData) {
    try {
      const message = new this.Messages(messageData);
      await message.save();
      return message;
    } catch (error) {
      console.log("Adding error the messages", error.message);
    }
  }

  async getMessages() {
    try {
      return await this.Messages.find({}).lean();
    } catch (error) {
      console.log("Load error the messages", error.message);
    }
  }
}
