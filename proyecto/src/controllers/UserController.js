import { UserMongoDao as UserDao } from "../dao/UserMongoDAO.js";
import { userService } from "../repository/usersService.js";
import { ERRORS } from "../utils/EErrors.js";
import { CustomError } from "../utils/customError.js";

const userDao = new UserDao();

export class UserController {
  static addPropUsers = async (req, res) => {
    try {
      const { newProp, value } = req.body;

      const users = await userDao.getAllUsers();

      const userWithProp = users.find((user) => user.hasOwnProperty(newProp));
      if (userWithProp) {
        return res
          .status(400)
          .json({ message: `Property ${newProp} already exists` });
      }

      users.map(async (user) => {
        if (!user.hasOwnProperty(newProp)) {
          user[newProp] = value;
          await userDao.update(user._id, { [newProp]: value });
          return user;
        }
      });

      res.status(200).json({ message: "Prop added successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

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

      const requiredDocuments = [
        "identification",
        "addressProof",
        "accountStatement",
      ];
      const missingDocuments = requiredDocuments.filter(
        (doc) => !user.documents.some((d) => d.name === doc)
      );

      if (missingDocuments.length > 0) {
        return res.status(400).json({
          message: `Missing required documents: ${missingDocuments.join(", ")}`,
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
      // console.log(error);
      throw new CustomError({
        name: "Internal server error",
        cause: "Internal server error",
        message: "unexpected server error",
        code: ERRORS["INTERNAL SERVER ERROR"],
      });
    }
  };
  static uploadsDocuments = async (req, res) => {
    try {
      const userId = req.user.user._id;
      const user = await userDao.getById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const files = req.files;
      if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({ message: "No files uploaded." });
      }

      let allFiels = [];
      Object.keys(files).forEach((key) => {
        allFiels = allFiels.concat(files[key]);
      });

      const existingFileName = user.documents.map((doc) => doc.name);

      const newFiles = allFiels.filter(
        (file) => !existingFileName.includes(file.filename)
      );
      if (newFiles.length === 0) {
        return res.status(400).json({
          message: `Files already exist`,
        });
      }

      user.documents = user.documents.concat(
        newFiles.map((file) => ({ name: file.filename, reference: file.path }))
      );
      await userDao.update(userId, { documents: user.documents });

      res
        .status(200)
        .json({ message: "Documents uploaded successfully", files });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
