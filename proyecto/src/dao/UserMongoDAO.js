import { User } from "./models/user.model.js";

export class UserMongoDao {
  async getAll(filter = {}) {
    try {
      return await User.findOne(filter).lean();
    } catch (error) {
      console.error("error getting user", error);
    }
  }

  async getAllUsers(filter = {}) {
    try {
      return await User.find(filter).lean();
    } catch (error) {
      console.error("error getting users", error);
    }
  }

  async getById(id) {
    try {
      return await User.findById(id).lean();
    } catch (error) {
      console.error("error getting user", error);
    }
  }

  async create(user) {
    try {
      return await User.create(user);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  async update(id, updates) {
    try {
      return await User.findByIdAndUpdate(id, updates, { new: true }).lean();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }

  async updatePassword(userId, password) {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { password },
        { new: true }
      ).lean();
    } catch (error) {
      console.error("Error updating user password:", error);
    }
  }

  async deleteUsers(ids) {
    try {
      const result = await User.deleteMany({ _id: { $in: ids } });
      return result;
    } catch (error) {
      console.error("error deleting users", error);
    }
  }

  async deleteUser(id) {
    try {
      return await User.findByIdAndDelete(id).lean();
    } catch (error) {
      console.error("error deleting user", error);
    }
  }
}
