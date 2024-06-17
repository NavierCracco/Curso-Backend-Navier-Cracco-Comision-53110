import { UserMongoDao as UserDao } from "../dao/UserMongoDAO.js";
import { ERRORS } from "../utils/EErrors.js";
import { CustomError } from "../utils/customError.js";

const userDao = new UserDao();

export class UserController {
  static updateRole = async (req, res) => {
    const { uid } = req.params;
    const { role } = req.body;

    try {
      const user = await userDao.getById(uid);
      if (!user) {
        throw new CustomError({
          name: "Not Found",
          cause: "Invalid arguments",
          message: "Not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      const updatedUser = await userDao.update(uid, { role: role });
      if (!updatedUser) {
        throw new CustomError({
          name: "Internal server error",
          cause: "Invalid arguments",
          message: "Error updating user role",
          code: ERRORS["INTERNAL SERVER ERROR"],
        });
      }

      res.json({ message: "Role updated successfully" });
    } catch (error) {
      console.log(error);
      //   throw new CustomError({
      //     name: "Internal server error",
      //     cause: "Internal server error",
      //     message: "unexpected server error",
      //     code: ERRORS["INTERNAL SERVER ERROR"],
      //   });
    }
  };
}
