import { User } from "./models/user.model.js";

export class UserMongoDao {
  async getAll(filter = {}) {
    return await User.findOne(filter).lean();
  }

  async getById(id) {
    return await User.findById(id).lean();
  }

  async create(user) {
    return await User.create(user);
  }
}
