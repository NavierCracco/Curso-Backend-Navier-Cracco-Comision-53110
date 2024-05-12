import dotenv from "dotenv";

dotenv.config({
  override: true,
  path: "./src/.env",
});

export const config = {
  general: {
    PORT: process.env.PORT || 8080,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
  },
  db: {
    URL: process.env.MONGO_URL,
  },
  github: {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
};
