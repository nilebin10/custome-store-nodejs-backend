import 'jest';
import { describe, test, expect, beforeEach } from '@jest/globals';
import { ProductService } from './product-service';
import products from './productList.json';

describe('ProductService', () => {
    let productService: ProductService;
    beforeEach(() => {
        productService = new ProductService();
    });

    test('Should return products array on getProducts', async () => {
        const data = await productService.getProducts();
        expect(data).toEqual(products);
    })

    test('Should return error object for wrong productid from getProductById', async () => {
        try {
            await productService.getProductById('123');
        } catch(err) {
            expect(err).toEqual({
                message: 'Product Not found',
                errorCode: 404
            });
        }
    })

    test('Should return correct data for productid from getProductById', async () => {
        const data = await productService.getProductById('7567ec4b-b10c-48c5-9345-fc73c48a80a0');
        expect(data).toEqual(
            {
                "description": "Short Product Description3",
                "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
                "price": 10,
                "title": "ProductNew"
            }
        );
    })
});

