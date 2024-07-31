import { UsersDTO } from "../DTO/usersDTO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";

class UsersService {
  constructor(dao) {
    this.dao = dao;
  }

  async getUserById(id) {
    const user = await this.dao.getById(id);
    if (user) {
      return new UsersDTO(user);
    }
    return user;
  }
}

export const userService = new UsersService(new UserMongoDao());
