import winston from "winston";
import { config } from "../config/config.js";

const customLevels = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5,
};

const transportFile = new winston.transports.File({
  filename: "./src/logs/errors.log",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  level: "warning",
});

const transportConsole = new winston.transports.Console({
  level: "fatal",
  format: winston.format.combine(
    winston.format.colorize({
      colors: {
        debug: "blue",
        http: "green",
        info: "cyan",
        warning: "yellow",
        error: "red",
        fatal: "magenta",
      },
    }),
    winston.format.simple()
  ),
});

export const developmentLogger = winston.createLogger({
  levels: customLevels,
  format: winston.format.combine(winston.format.simple()),
  transports: [],
});

export const productionLogger = winston.createLogger({
  levels: customLevels,
  format: winston.format.json(),
  transports: [],
});

if (config.general.MODE != "production") {
  developmentLogger.add(transportConsole);
} else {
  customLevels.fatal = 0;
  customLevels.error = 1;
  customLevels.warning = 2;
  customLevels.info = 3;
  customLevels.http = 4;
  customLevels.debug = 5;
  productionLogger.add(transportFile);
}
