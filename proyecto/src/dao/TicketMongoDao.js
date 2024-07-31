import { Ticket } from "./models/ticket.model.js";

export class TicketMongoDao {
  async getTicketById(id) {
    try {
      return await Ticket.findById(id).lean();
    } catch (error) {
      console.error("Error getting ticket by ID:", error);
    }
  }

  async getTicketByFilter(filter) {
    try {
      return await Ticket.find(filter).lean();
    } catch (error) {
      console.error("Error getting ticket by filter:", error);
    }
  }

  async updateTicket(id, ticket) {
    try {
      return await Ticket.findByIdAndUpdate(id, ticket, { new: true });
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  }

  async deleteTickets() {
    try {
      return await Ticket.deleteMany({});
    } catch (error) {
      console.error("Error deleting tickets:", error);
    }
  }

  async deleteTicket(id) {
    try {
      return await Ticket.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  }
}
