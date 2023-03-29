import * as handlers from "./handlers";

const getProducts = handlers.getProducts;
const getProductById = handlers.getProductById;
const createProduct = handlers.createProduct;
const catalogBatchProcess = handlers.catalogBatchProcess;

export {
  getProducts,
  getProductById,
  createProduct,
  catalogBatchProcess
}