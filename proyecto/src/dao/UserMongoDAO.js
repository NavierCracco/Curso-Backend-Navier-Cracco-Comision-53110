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

  async update(id, updates) {
    return await User.findByIdAndUpdate(id, updates, { new: true }).lean();
  }

  async updatePassword(userId, password) {
    return await User.findByIdAndUpdate(
      userId,
      { password },
      { new: true }
    ).lean();
  }
}
