import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log(file);
    let folderName = "";
    switch (file.fieldname) {
      case "profiles":
        folderName = "profiles";
        break;
      case "products":
        folderName = "products";
        break;
      case "documents":
        folderName = "documents";
        break;
      default:
        folderName = "others";
    }
    cb(null, `src/uploads/${folderName}`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });

export default __dirname;

// export const productsPath = join(__dirname, "data", "products.json");
// export const cartsPath = join(__dirname, "data", "carts.json");

// User de prueba admin
// const adminUser = {
//   username: "Batman",
//   email: "adminCoder@coder.com",
//   password: "adminCod3r123",
//   role: "admin",
// };
