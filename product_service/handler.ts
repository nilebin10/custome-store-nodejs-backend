import * as handlers from "./handlers";

const getProducts = handlers.getProducts;
const getProductById = handlers.getProductById;
const createProduct = handlers.createProduct;

export {
  getProducts,
  getProductById,
  createProduct
}