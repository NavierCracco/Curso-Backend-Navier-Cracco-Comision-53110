import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const transporter = nodemailer.createTransport({
  service: config.nodemailer.SERVICE,
  port: config.nodemailer.PORT,
  auth: {
    user: config.nodemailer.USER,
    pass: "ppzu yriu gblv bvre",
  },
});

export const sendMail = async (to, subject, message) => {
  return await transporter.sendMail({
    from: "Messi",
    to,
    subject,
    html: message,
  });
};
