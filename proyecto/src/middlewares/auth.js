import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../dao/models/user.model.js";
dotenv.config();

export function ensureAuthenticated(req, res, next) {
  let token = null;
  if (req.signedCookies.naviCookie) {
    token = req.signedCookies.naviCookie;
  }
  // console.log(token);

  if (!token) {
    return res.status(401).json({ error: `No existen usuarios autenticados` });
  }

  try {
    const decoded = jwt.verify(token, process.env.COOKIE_SECRET);
    // console.log("decoded:", decoded);
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
      if (!req.user.user._id) {
        res.setHeader("Content-Type", "application/json");
        return res.status(401).json({ error: `No existen usuarios ` });
      }
      // console.log(req.user.role);
      if (!access.includes(req.user.user.role)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(403)
          .json({ error: `No tienes permiso para acceder a este recurso` });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }

    next();
  };
}
