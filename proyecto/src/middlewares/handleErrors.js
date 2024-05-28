import { ERRORS } from "../utils/EErrors.js";

export const handleError = (error, req, res, next) => {
  console.log("******************");
  console.log(`${error.cause ? error.cause : error.stack}`);
  console.log("******************");

  switch (error.code) {
    case ERRORS["BAD REQUEST"]:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(ERRORS["BAD REQUEST"])
        .json({ error: `${error.name}`, detalle: error.message });

    case ERRORS["UNAUTHORIZED"]:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(ERRORS["UNAUTHORIZED"])
        .json({ error: `${error.name}`, detalle: error.message });

    case ERRORS["FORBIDDEN"]:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(ERRORS["FORBIDDEN"])
        .json({ error: `${error.name}`, detalle: error.message });

    case ERRORS["NOT FOUND"]:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(ERRORS["NOT FOUND"])
        .json({ error: `${error.name}`, detalle: error.message });

    default:
      res.setHeader("Content-Type", "application/json");
      return res
        .status(ERRORS["INTERNAL SERVER ERROR"])
        .json({ error: `Unexpected server error`, detalle: error.message });
  }
};
