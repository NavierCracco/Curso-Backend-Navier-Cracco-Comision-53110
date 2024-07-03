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

describe("Testing router cart", function () {
  describe("GET /cart", function () {
    it("should get all carts", async () => {
      const { _body, status, ok, headers } = await requester.get("/cart");

      expect(_body.carts).to.be.a("array");
      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(headers["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("GET /cart/:cartId", async function () {
    let cookie;
    let token;
    it("should get a cart by ID", async () => {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { _body, status, ok } = await requester
        .get("/cart/666f62cdc5ba9dde9455f105")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(_body).to.be.a("object");
      expect(_body.cart).to.have.property("_id");
      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
    });

    it("should return a 500 error if the cart ID is invalid", async () => {
      const { status, ok } = await requester
        .get("/cart/invalid-id")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(500);
      expect(ok).to.be.false;
    });
  });

  describe("POST /cart/:cartId/product/:productId", function () {
    let cookie;
    let token;
    it("should add a product to the cart", async () => {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { status, ok, body, header } = await requester
        .post("/cart/668367ff9238979d05a272b2/product/65ffacfc3c8dee81c814ab08")
        .send({ quantity: 1, price: 40000000 })
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body).to.be.a("object");
      expect(body.cart).to.have.property("_id");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 400 error if you are owner of the product", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "cracconavier@gmail.com", password: "123" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { status, ok, body, header } = await requester
        .post("/cart/666f62cdc5ba9dde9455f105/product/667b90ccd7da9bc07c856a78")
        .send({ quantity: 1, price: 40000000 })
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(400);
      expect(ok).to.be.false;
      expect(body.message).to.be.equal(
        "you can't add your own product to the cart"
      );
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 500 error if the cart ID or product ID is invalid or missing field", async () => {
      const { status, ok, body, header } = await requester
        .post("/cart/invalid-cartId/product/invalid-productId")
        .send({ quantity: 1 })
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(500);
      expect(ok).to.be.false;
      expect(body).has.property("error");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("PUT /cart/:cartId/product/:productId", function () {
    it("should update quantity of a product", async function () {
      const { status, ok, body, header } = await requester
        .put("/cart/668367ff9238979d05a272b2/product/65ffacfc3c8dee81c814ab08")
        .send({ quantity: 1 });

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body).to.be.a("object");
      expect(body.cart).to.have.property("_id");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 500 error if the cart ID is invalid or product ID", async function () {
      const { status, ok, body, header } = await requester
        .put("/cart/invalid-cartId/product/invalid-productId")
        .send({ quantity: 1 });

      expect(status).to.be.equal(500);
      expect(ok).to.be.false;
      expect(body).has.property("error");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("GET /cart/:cartId/purchase", function () {
    it("should purchase a cart", async function () {
      const { status, ok, body, header } = await requester.get(
        "/cart/6684462d2a936fd71c992ca9/purchase"
      );

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body).to.be.a("object");
      expect(body.message).to.be.equal("Purchase completed successfully");
      expect(body.ticket).to.has.property("_id");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 404 error if a product without stock", async function () {
      const { status, ok, body, header } = await requester.get(
        "/cart/666f62cdc5ba9dde9455f105/purchase"
      );

      expect(status).to.be.equal(404);
      expect(ok).to.be.false;
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 500 error if the cart ID is invalid", async function () {
      const { status, ok, body, header } = await requester.get(
        "/cart/invalid-cartId/purchase"
      );

      expect(status).to.be.equal(500);
      expect(ok).to.be.false;
      expect(body).has.property("error");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("DELETE /cart/:CartId/product/:productId", function () {
    it("should delete a product from the cart", async function () {
      const { status, ok, body, header } = await requester.delete(
        "/cart/668367ff9238979d05a272b2/product/65ffacfc3c8dee81c814ab08"
      );

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body).to.be.a("object");
      expect(body.cart).to.have.property("_id");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 500 error if the cart ID is invalid or product ID", async function () {
      const { status, ok, body, header } = await requester.delete(
        "/cart/invalid-cartId/product/invalid-productId"
      );

      expect(status).to.be.equal(500);
      expect(ok).to.be.false;
      expect(body).has.property("error");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });

  describe("DELETE /cart/:cartId", function () {
    let token;
    let cookie;
    it("should delete a cart", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];
      const { status, ok, body, header } = await requester
        .delete("/cart/668367ff9238979d05a272b2")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(200);
      expect(ok).to.be.true;
      expect(body).to.be.a("object");
      expect(body.message).to.be.equal("Empty cart");
      expect(body.cart).to.have.property("_id");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });

    it("should return a 500 error if the cart ID is invalid", async function () {
      const tokenResponse = await requester
        .post("/api/sessions/login")
        .send({ email: "test@testing.com", password: "123456789" });
      cookie = tokenResponse.headers["set-cookie"][0].split(";")[0];
      token = cookie.split("=")[1];

      const { status, ok, body, header } = await requester
        .delete("/cart/invalid-cartId")
        .set("Cookie", `${cookie}`)
        .set("authorization", `Bearer ${token}`);

      expect(status).to.be.equal(500);
      expect(ok).to.be.false;
      expect(body).has.property("error");
      expect(header["content-type"]).to.be.equal(
        "application/json; charset=utf-8"
      );
    });
  });
}); // fin
