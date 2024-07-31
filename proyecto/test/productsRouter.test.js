import { expect } from "chai";
import { describe, it } from "mocha";
import { config } from "../src/config/config.js";
import mongoose from "mongoose";
import supertest from "supertest";

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

describe("Testing router products", function () {
  this.timeout(15000);

  before(async () => {
    await connDB();
  });

  afterEach(async () => {
    await mongoose.connection
      .collection("products")
      .deleteMany({ category: "pruebas" });
  });

  describe("GET /api/products/", function () {
    let cookie;
    let token;
    it("should return all products on db", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { body, status, headers } = await requester
        .get("/api/products/")
        .set("Cookie", `${cookie}`)
        .set("Authorization", `Bearer ${token}`);

      expect(status).to.equal(200);
      expect(body).to.be.an("object");
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("POST /api/products/", function () {
    let cookie;
    let token;
    it("should create a new product", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const newProduct = {
        title: "Producto de prueba",
        description: "Este es un producto de prueba",
        price: 200,
        category: "pruebas",
        stock: 25,
        thumbnail: "Sin imagen",
        code: "abc1234",
      };

      const { body, status, headers, ok } = await requester
        .post("/api/products/")
        .send(newProduct)
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(201);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.true;
      expect(body).to.be.an("object");
      expect(body.newProduct).has.property("_id");
    });

    it("should return a 400 error if the product is a missing field", async function () {
      const newProduct = {
        title: "Producto de prueba",
        description: "Este es un producto de prueba",
        price: 200,
        category: "pruebas",
        stock: 25,
        thumbnail: "Sin imagen",
        //   code: "abc1234567",
      };

      const { body, status, headers, ok } = await requester
        .post("/api/products/")
        .send(newProduct)
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(400);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.false;
      expect(body).to.be.an("object");
    });
  });

  describe("PUT /api/products/:pid", async function () {
    let cookie;
    let token;
    it("should update a product", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "cracconavier@gmail.com", password: "123" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const updatedProduct = {
        title: "Producto de prueba actualizado",
        description: "Este es un producto de prueba actualizado",
        price: 200,
        category: "swagger",
        stock: 25,
        thumbnail: "Sin imagen",
        code: "abc12",
      };
      const { _body, status, headers, ok } = await requester
        .put("/api/products/667b90ccd7da9bc07c856a78")
        .send(updatedProduct)
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(200);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.true;
      expect(_body).to.be.an("object");
    });

    it("should return a 404 error if product not found", async function () {
      const updatedProduct = {
        title: "Producto de prueba actualizado",
        description: "Este es un producto de prueba",
        price: 200,
        category: "pruebas",
        stock: 25,
        thumbnail: "Sin imagen",
        code: "abc12",
      };
      const { status, headers, ok } = await requester
        .put("/api/products/667b90ccd7da9bc012345678")
        .send(updatedProduct)
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(404);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.false;
    });

    it("should return a 403 error if not have permission for update products", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "tito@test.com", password: "123" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const updatedProduct = {
        title: "Producto de prueba actualizado",
        description: "Este es un producto de prueba",
        price: 200,
        category: "pruebas",
        stock: 25,
        thumbnail: "Sin imagen",
        code: "abc12",
      };
      const { status, headers, ok } = await requester
        .put("/api/products/667b90ccd7da9bc07c856a78")
        .send(updatedProduct)
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(403);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.false;
    });
  });

  describe("DELETE /api/products/:pid", async function () {
    let cookie;
    let token;
    it("should delete a product", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { _body, status, headers, ok } = await requester
        .delete("/api/products/66844a6bd02ed08218da7c5c")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(200);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(_body).to.be.an("object");
      expect(ok).to.be.true;
    });

    it("should return a 403 error if not have permission for delete products", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "tito@test.com", password: "123" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { status, headers, ok } = await requester
        .delete("/api/products/66844a75d02ed08218da7c5f")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(403);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.false;
    });

    it("should return a 404 error if product not found", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { status, headers, ok } = await requester
        .delete("/api/products/667b90ccd7da9bc07c856123")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.equal(404);
      expect(headers["content-type"]).to.equal(
        "application/json; charset=utf-8"
      );
      expect(ok).to.be.false;
    });
  });
}); // fin
