import { expect } from "chai";
import { describe, it } from "mocha";
import { config } from "../src/config/config.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import supertest from "supertest";
import { UserMongoDao as UserDao } from "../src/dao/UserMongoDAO.js";

const userDao = new UserDao();
const requester = supertest("http://localhost:8080");

const connDB = async () => {
  try {
    await mongoose.connect(config.db.URL);
    // console.log("DB connected");
  } catch (error) {
    console.log(`Error connecting to db:, ${error}`);
  }
};
connDB();

describe("Testing router sessions", function () {
  this.timeout(10000);

  after(async () => {
    await mongoose.connection
      .collection("users")
      .deleteMany({ first_name: "test" });
  });

  describe("POST /api/sessions/register", function () {
    it("should redirec to /api/sessions/login", async function () {
      const mockUser = {
        first_name: "test",
        last_name: "test",
        email: "abc@test.com",
        password: "123",
        age: 21,
        role: "usuario",
      };

      const { request, headers } = await requester
        .post("/api/sessions/register")
        .send(mockUser);

      let cookie = headers["set-cookie"][0].split("=")[0];
      const cookieSecret = config.general.COOKIE_SECRET;

      expect(request._data).to.be.a("object");
      expect(request._data.email).to.be.equal(mockUser.email);
      expect(cookie).to.be.equal(cookieSecret);
    });
  });

  describe("POST /api/sessions/login", function () {
    it("should redirec to /", async function () {
      const mockUser = {
        email: "test@testing.com",
        password: "123456789",
      };

      const { _body, headers, status, ok } = await requester
        .post("/api/sessions/login")
        .send(mockUser);

      let cookie = headers["set-cookie"][0].split("=")[0];
      const cookieSecret = config.general.COOKIE_SECRET;

      expect(_body).to.be.a("object");
      expect(_body.userLogued.email).to.be.equal(mockUser.email);
      expect(_body.userLogued).has.property("_id");
      expect(cookie).to.be.equal(cookieSecret);
      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
    });
  });

  describe("GET /api/sessions/logout", function () {
    let cookie;
    let token;

    it("should redirect to /api/sessions/login and delete cookie", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { headers } = await requester
        .get("/api/sessions/logout")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(headers["location"]).to.be.equal("/api/sessions/login");
    });
  });

  describe("GET /api/sessions/current", function () {
    let cookie;
    let token;

    it("should return a user", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { _body, status, ok, headers } = await requester
        .get("/api/sessions/current")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(_body).to.be.a("object");
      expect(_body.perfil).has.property("email");
      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(headers["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("POST /api/sessions/resetpassword", function () {
    it("should send an email to reset the password", async function () {
      const { headers } = await requester
        .post("/api/sessions/resetpassword")
        .send({ email: "test@testing.com" });

      expect(headers["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 500 error if there error to send email", async function () {
      const { headers, status } = await requester
        .post("/api/sessions/resetpassword")
        .send({ email: "XXXXXXXXXXXXXXXX" });

      expect(status).to.be.equal(500);
      expect(headers["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("POST /api/sessions/createdpassword", function () {
    it("should change the password", async function () {
      const user = await userDao.getAll({ email: "test@testing.com" });

      let token = jwt.sign({ user }, config.general.COOKIE_SECRET, {
        expiresIn: "1hr",
      });

      await requester
        .get("/api/sessions/resetpassword")
        .query({ token: token });

      const { headers, request } = await requester
        .post("/api/sessions/createdpassword")
        .send({ token: token, password: "123456789" });

      expect(headers["location"]).to.be.equal(
        "/api/sessions/login?message=contrasena%20creada%20exitosamente"
      );
      expect(request._data).to.be.a("object");
      expect(request._data.token).to.be.equal(token);
    });

    it("should return a 500 error if there error updatating password", async function () {
      const user = await userDao.getAll({ email: "test@testing.com" });

      let token = jwt.sign({ user }, config.general.COOKIE_SECRET, {
        expiresIn: "1hr",
      });

      await requester
        .get("/api/sessions/resetpassword")
        .query({ token: token });

      const { headers, status, body } = await requester
        .post("/api/sessions/createdpassword")
        .send({ token: "invalid-token", password: "123456789" });

      expect(status).to.be.equal(500);
      expect(headers["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
      expect(body.message).to.be.equal("Error al actualizar la contraseña");
    });
  });
}); // fin
