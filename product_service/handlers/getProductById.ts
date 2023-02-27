import { createResponse, ProductService, STATUS_CODE } from '../services';

const productService = new ProductService();
export async function getProductById(event: any) {

  try {
    const { productid } = event.pathParameters;
    const data: any = await productService.getProductById(productid);
    const response = createResponse(data, false, STATUS_CODE.SUCCESS);
    return response
  } catch(err: any) {
    const response = createResponse(err, true, err.errorCode ?? STATUS_CODE.INTERNAL_ERROR);
    return response
  }
}