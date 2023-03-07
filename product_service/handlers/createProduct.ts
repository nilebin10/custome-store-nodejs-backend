import { ProductService, createResponse, STATUS_CODE } from '../services';
import { winstonLogger } from '../services/logger.service';

const productService = new ProductService();
export async function createProduct(event: any) {

  try {
    const { body } = event;
    debugger;
    console.log(body);
    winstonLogger.logRequest(`CREATE_PRODUCT:: Request with ${JSON.stringify(body)}`);
    const data = await productService.createProduct(body);
    const response = createResponse(data, false, STATUS_CODE.SUCCESS);
    return response
  } catch(err: any) {
    const response = createResponse(err, true, err.errCode ?? STATUS_CODE.INTERNAL_ERROR);
    return response
  }
}