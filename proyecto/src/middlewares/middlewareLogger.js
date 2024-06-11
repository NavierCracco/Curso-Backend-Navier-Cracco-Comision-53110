import { developmentLogger, productionLogger } from "../utils/winstonConfig.js";
import { config } from "../config/config.js";

export const middlewareLogger = (req, res, next) => {
  if (config.general.MODE != "production") {
    req.logger = developmentLogger;
  } else {
    req.logger = productionLogger;
  }
  next();
};
