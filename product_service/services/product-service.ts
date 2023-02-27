import { STATUS_CODE } from ".";
import products from "./productList.json";

export class IProductService {
    getProducts!: () => Promise<any[]>;
    getProductById!: (id: string) => Promise<any>;
}

export class ProductService implements IProductService {

    getProducts() {
        return Promise.resolve(products);
    }

    getProductById(id: string) {
        try {
            const product = products.find((item) => item?.id === id);
            if (!product) {
                return Promise.reject({
                    message: 'Product Not found',
                    errorCode: STATUS_CODE.NOT_FOUND
                })
            }
            return Promise.resolve(product);
        } catch(err) {
            const error = {
                message: 'Something Went Wrong',
                errorCode: STATUS_CODE.INTERNAL_ERROR
            }
            return Promise.reject(error);
        }
    }
}