import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: "587",
  auth: {
    user: "cracconavier@gmail.com",
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
