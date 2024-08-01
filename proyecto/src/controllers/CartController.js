import { CartMongoDao } from "../dao/CartMongoDAO.js";
import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";
import { UserMongoDao } from "../dao/UserMongoDAO.js";
import { TicketMongoDao } from "../dao/TicketMongoDao.js";
import { Ticket } from "../dao/models/ticket.model.js";
import { ERRORS } from "../utils/EErrors.js";
import { CustomError } from "../utils/customError.js";
import { sendMail } from "../utils/sendMail.js";

const cartManager = new CartMongoDao();
const productManager = new ProductMongoDao();
const userManager = new UserMongoDao();
const ticketManager = new TicketMongoDao();

export class CartController {
  static createCart = async (req, res) => {
    try {
      const cart = await cartManager.createCart();
      res.status(200).json({ cart: cart });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };

  static getCarts = async (req, res) => {
    try {
      const carts = await cartManager.getCarts();
      if (!carts) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "Carts not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      res.status(200).json({ message: "carts", carts });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static getCartById = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid arguments",
          message: "Cart not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      const cart = await cartManager.getCartById(cartId);

      res.status(200).json({ message: "cart found", cart });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static getCartByIdRenderPage = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid arguments",
          message: "Cart not found",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.getCartById(cartId);
      const isEmpty = cart.products.length === 0;

      const userId = cart.userId;
      const user = await userManager.getById(userId);
      delete user.password;
      delete user.documents;

      res.render("cart", { cart, user, isEmpty });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static addProductToCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity, price } = req.body;
    const userId = req.user._id;

    try {
      if (!cartId || !productId) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "Cart or product not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      if (typeof quantity !== "number" || typeof price !== "number") {
        throw new CustomError({
          name: "Bad request",
          cause: "quantity or price are invalid",
          message: "invalid properties",
          code: ERRORS["BAD REQUEST"],
        });
      }

      const product = await productManager.getProductById(productId);

      if (!product.owner) {
        const cart = await cartManager.addProductToCart(
          cartId,
          productId,
          quantity,
          price
        );

        res.status(200).json({ message: "Product added", cart });
      } else if (userId.toString() !== product.owner.toString()) {
        const cart = await cartManager.addProductToCart(
          cartId,
          productId,
          quantity,
          price
        );

        res.json({ message: "Product added", cart });
      } else {
        res
          .status(400)
          .json({ message: "you can't add your own product to the cart" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static updateProductQuantity = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    try {
      if (!cartId || !productId) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "CartId or productId not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      if (!quantity) {
        throw new CustomError({
          name: "Bad request",
          cause: "invalid properties",
          message: "invalid properties",
          code: ERRORS["BAD REQUEST"],
        });
      }

      const cartUpdated = await cartManager.updateProductQuantity(
        cartId,
        productId,
        quantity
      );
      const cart = await cartManager.getCartById(cartId);
      let newTotalPrice = 0;
      cart.products.forEach((product) => {
        const productQuantity = product.quantity;
        const productUnitPrice = product.productId.price;
        const productPrice = productQuantity * productUnitPrice;
        newTotalPrice += productPrice;
      });

      const cartUpdatedWithNewTotalPrice = {
        _id: cartUpdated._id,
        totalPrice: newTotalPrice,
        products: cartUpdated.products,
        userId: cartUpdated.userId,
      };

      await cartManager.updateCart(cartId, cartUpdatedWithNewTotalPrice);

      res.status(200).json({
        message: "Updated product quantity",
        cartUpdated: cartUpdatedWithNewTotalPrice,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  static deleteProductCart = async (req, res) => {
    const { cartId, productId } = req.params;

    try {
      if (!cartId || !productId) {
        throw new CustomError({
          name: "Not Found",
          cause: "cartId or productId are invalid",
          message: "Cart or product not found",
          code: ERRORS["NOT FOUND"],
        });
      }

      const product = await productManager.getProductById(productId);
      const deletedCart = await cartManager.deleteProductCart(
        cartId,
        productId
      );

      deletedCart.totalPrice -= product.price * product.quantity;
      let updatedCart = await cartManager.updateCart(cartId, deletedCart);

      res.status(200).json({
        message: "Product removed from cart",
        updatedCart,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static clearCart = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid cartId",
          message: "invalid argument",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.clearCart(cartId);

      cart.totalPrice = 0;

      res.status(200).json({ message: "Empty cart", cart });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static finalizePurchase = async (req, res) => {
    const { cartId } = req.params;

    try {
      if (!cartId) {
        throw new CustomError({
          name: "Not Found",
          cause: "invalid cartId",
          message: "Cart not found",
          code: ERRORS["NOT FOUND"],
        });
      }
      const cart = await cartManager.getCartById(cartId);

      let userId = await userManager.getById(cart.userId);
      let userEmail = userId.email;

      const itemsWithStock = [];
      const itemsWithoutStock = [];

      for (let item of cart.products) {
        let product = await productManager.getProductById(item.productId._id);

        if (product && product.stock > 0) {
          itemsWithStock.push(product);
        } else {
          itemsWithoutStock.push(item.productId._id);
        }
      }

      if (itemsWithoutStock > 0) {
        return res.status(400).json({
          message: "Some products are out of stock.",
          itemsWithoutStock,
        });
      }

      const ticket = new Ticket({
        code: Date.now(),
        amount: cart.totalPrice,
        purchaser: userEmail,
      });
      await ticket.save();

      if (cart.products.length === 0) {
        cart.totalPrice = 0;
      }

      res.status(200).json({
        message: "Ticket generated correctly.",
        ticket,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static showPurchaseTicket = async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.user._id;

    try {
      const user = await userManager.getById(userId);
      delete user.password;
      delete user.documents;

      const ticket = await ticketManager.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.render("ticket", { ticket, user });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static finalizedPurchase = async (req, res) => {
    const { ticketId } = req.params;
    const userId = req.user._id;

    try {
      const user = await userManager.getById(userId);
      const cart = await cartManager.getCartById(user.cart);

      const ticket = await ticketManager.getTicketById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const sendPurchaseEmail = async (user) => {
        const subject = "Compra realizada";
        const message = `<h1>Hola ${user.first_name}!</h1>
        <p>Tu compra ha sido realizada con exito.</p>
        <h3>Ticket: </h3>
        <ul>
        <p><strong>Código:</strong> ${ticket.code}</p>
        <hr />
        <p><strong>Productos: </strong></p>
        <ul>
        ${cart.products
          .map(
            (item) =>
              `<li><strong>${item.productId.title}</strong> - <strong>Cantidad: </strong>${item.quantity} - <strong>Precio: </strong>$${item.productId.price}</li>`
          )
          .join("")}
          </ul>
        <hr />
        <p><strong>Precio final:</strong> $${ticket.amount}</p>
        </ul>
        <p>Gracias por tu compra!</p>`;
        await sendMail(user.email, subject, message);
      };
      sendPurchaseEmail(user);

      if (!sendPurchaseEmail) {
        return res.status(500).json({ message: "Error sending email" });
      } else {
        await ticketManager.updateTicket(ticketId, { payment_made: true });
      }

      const tickets = await ticketManager.getTicketByFilter({
        purchaser: ticket.purchaser,
      });
      tickets.forEach(async (ticket) => {
        if (ticket.payment_made === false) {
          await ticketManager.deleteTicket(ticket._id);
        }
      });

      for (let item of cart.products) {
        let product = await productManager.getProductById(item.productId._id);
        product.stock -= item.quantity;
        await productManager.updateProduct(item.productId._id, product);
      }
      await cartManager.clearCart(cart._id);

      res
        .status(200)
        .json({ message: "Purchase completed successfully", ticket });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal server error", error: error.message });
    }
  };

  static deleteCarts = async (req, res) => {
    try {
      const allUsers = await userManager.getAllUsers();

      const allCarts = await cartManager.getCarts();

      const validUsersIds = new Set(
        allUsers.map((user) => user._id.toString())
      );

      const cartsToDelete = allCarts
        .filter((cart) => {
          return !cart.userId || !validUsersIds.has(cart.userId.toString());
        })
        .map((cart) => {
          return cart._id.toString();
        });

      if (cartsToDelete.length === 0) {
        return res.status(404).json({ message: "No carts to delete" });
      }

      const deletedCarts = await cartManager.deleteCarts(cartsToDelete);

      return res
        .status(200)
        .json({ message: "Carts deleted successfully", deletedCarts });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  static deleteTickets = async (req, res) => {
    try {
      const deletedTickets = await ticketManager.deleteTickets();

      return res.status(200).json({
        message: `${deletedTickets.deletedCount} tickets deleted successfully`,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}
