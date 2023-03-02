import { describe, test, expect, jest } from '@jest/globals';
import { getProductById } from './getProductById';
import { ProductService } from '../services/product-service';

jest.mock<typeof import('../services/product-service')>('../services/product-service');
const mockMethod = jest.fn<() => any>();

const getProductByIdMock = jest
  .spyOn(ProductService.prototype, 'getProductById')
  .mockImplementation(() => {
    return mockMethod();
  }); 

describe('getProductById', () => {     
    test('Should return undefined for wrong productid from getProdutById', async () => {
        mockMethod.mockReturnValue(Promise.reject({0: 'Internal Error'}));
        const data = await getProductById({ pathParameters: '123' });
        expect(data).toEqual(
            {
                "body": JSON.stringify({
                    err: { 0: 'Internal Error'},
                    message: "Unexpected error occured"
                }),
                "headers": {
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                "statusCode": 501
            }
        );
        expect(getProductByIdMock).toHaveBeenCalled();
    })

    test('Should return correct data for productid from getProdutById', async () => {
        mockMethod.mockReturnValue({ name: 'abc' });
        const data = await getProductById({ pathParameters: '7567ec4b-b10c-48c5-9345-fc73c48a80a0' });
        expect(data).toEqual(
            {
                "body": JSON.stringify({ name: 'abc' }),
                "headers": {
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                "statusCode": 200,
            }
        );
    })
});

