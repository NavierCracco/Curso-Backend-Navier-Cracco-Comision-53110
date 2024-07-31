import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export function ensureAuthenticated(req, res, next) {
  let token = null;
  if (req.signedCookies[config.general.COOKIE_SECRET]) {
    token = req.signedCookies[config.general.COOKIE_SECRET];
  }

  if (!token) {
    return res.status(401).json({ error: `No existen usuarios autenticados` });
  }

  try {
    const decoded = jwt.verify(token, config.general.COOKIE_SECRET);
    req.user = decoded;
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res
      .status(500)
      .json({ error: "Internal server error", detalle: error.message });
  }
  next();
}

export function ensureAccess(access = []) {
  return async (req, res, next) => {
    access = access.map((a) => a.toLowerCase());

    if (access.includes("public")) {
      return next();
    }

    try {
      if (!req.user._id) {
        res.setHeader("Content-Type", "application/json");
        return res.status(401).json({ error: `No existen usuarios ` });
      }

      if (!access.includes(req.user.role)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(403)
          .json({ error: `No tienes permiso para acceder a este recurso` });
      }
    } catch (error) {
      return res.status(500).json({ message: "error", error: error.message });
    }

    next();
  };
}
