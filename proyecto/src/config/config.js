import dotenv from "dotenv";

dotenv.config({
  override: true,
  path: "./src/.env",
});

export const config = {
  general: {
    PORT: process.env.PORT || 8080,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    MODE: process.env.MODE || "production",
  },
  db: {
    URL: process.env.MONGO_URL,
  },
  github: {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
  nodemailer: {
    SERVICE: process.env.NODEMAILER_SERVICE,
    PORT: process.env.NODEMAILER_PORT,
    USER: process.env.NODEMAILER_USER,
  },
};
