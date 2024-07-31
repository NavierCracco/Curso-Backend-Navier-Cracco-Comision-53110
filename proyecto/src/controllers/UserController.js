import { UserMongoDao as UserDao } from "../dao/UserMongoDAO.js";
import { ERRORS } from "../utils/EErrors.js";
import { CustomError } from "../utils/customError.js";
import { sendMail } from "../utils/sendMail.js";

const userDao = new UserDao();

export class UserController {
  static getUsers = async (req, res) => {
    try {
      const users = await userDao.getAllUsers();
      if (!users) {
        return res.status(404).json({ message: "Not found" });
      }

      let mainData = users.map((user) => {
        return {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        };
      });

      res.status(200).json(mainData);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static addPropUsers = async (req, res) => {
    const { newProp, value } = req.body;

    try {
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

    const userRole = req.user.role;

    try {
      if (role !== "usuario" && role !== "premium" && role !== "admin") {
        return res
          .status(400)
          .json({ message: "Invalid role, insert a valid role" });
      }

      const user = await userDao.getById(uid);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
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

      if (userRole !== "admin") {
        if (missingDocuments.length > 0) {
          return res.status(400).json({
            message: `Missing required documents: ${missingDocuments.join(
              ", "
            )}`,
          });
        }
      }

      if (user.role === "usuario" || user.role === "premium") {
        if (role === "admin") {
          return res
            .status(400)
            .json({ message: "Cannot change role to admin" });
        }
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

      res.status(200).json({ message: "Role updated successfully" });
    } catch (error) {
      throw new CustomError({
        name: "Internal server error",
        cause: "Internal server error",
        message: "unexpected server error",
        code: ERRORS["INTERNAL SERVER ERROR"],
      });
    }
  };
  static uploadsDocuments = async (req, res) => {
    const userId = req.user._id;

    try {
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

  static deleteInactiveUsers = async (req, res) => {
    try {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      const usersToDelete = await userDao.getAllUsers({
        last_connection: { $lt: twoDaysAgo },
        role: { $ne: "admin" },
      });

      if (usersToDelete.length === 0) {
        return res.status(404).json({ message: "No inactive users found" });
      }
      const emailsSentPromises = usersToDelete.map(async (user) => {
        const subject = "Tú cuenta ha sido eliminada por inactividad";
        const message = `<h1>Hola ${user.first_name}!</h1>
        <p>Te informamos que tu cuenta ha sido eliminada por inactividad.</p>
        <p>Si crees que este es un error, ponte en contacto con nosotros.</p>`;
        await sendMail(user.email, subject, message);
      });

      await Promise.all(emailsSentPromises);

      const usersIds = usersToDelete.map((user) => user._id);

      const deletedUsersCount = await userDao.deleteUsers(usersIds);

      res.status(200).json({
        message: `${deletedUsersCount.deletedCount} usuarios eliminados exitosamente.`,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static deleteUser = async (req, res) => {
    const { uid } = req.params;

    try {
      const user = await userDao.getById(uid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const deletedUser = await userDao.deleteUser(uid);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };
}
