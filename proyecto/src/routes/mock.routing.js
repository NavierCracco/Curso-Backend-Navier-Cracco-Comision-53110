import { Router } from "express";
import { generateMockProduct } from "../mocks/mock.js";

export const router = Router();

router.get("/", (req, res) => {
  const products = Array.from({ length: 100 }, generateMockProduct);

  res.setHeader("Content-Type", "application/json");
  res.json({ products: products });
});
