import { ProductMongoDao } from "../dao/ProductsMongoDAO.js";

const productManager = new ProductMongoDao();

export class HomeController {
  static home = async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    let queryParams = {};

    if (query) {
      queryParams = { ...queryParams, category: query };
    }

    try {
      const sortOptions = {};
      if (sort) {
        sortOptions.price = sort === "asc" ? 1 : -1;
      }

      let products = await productManager.getProductsPaginated(
        parseInt(limit),
        parseInt(page),
        sortOptions
      );

      const totalProducts = await productManager.Product.countDocuments(
        queryParams
      );
      const totalPages = Math.ceil(totalProducts / limit);

      const response = {
        status: "success",
        payload: products,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/?limit=${limit}&page=${page - 1}` : null,
        nextLink:
          page < totalPages ? `/?limit=${limit}&page=${page + 1}` : null,
      };
      res.render("home", { products });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };
}
