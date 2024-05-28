import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

// export const productsPath = join(__dirname, "data", "products.json");
// export const cartsPath = join(__dirname, "data", "carts.json");

// const adminUser = {
//   username: "Batman",
//   email: "adminCoder@coder.com",
//   password: "adminCod3r123",
//   role: "admin",
// };
