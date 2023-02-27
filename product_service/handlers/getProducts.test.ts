import { describe, test, expect, jest } from '@jest/globals';
import { getProducts } from './getProducts';
import { ProductService } from '../services/product-service';

jest.mock<typeof import('../services/product-service')>('../services/product-service');
const mockMethod = jest.fn<() => any>();

const getProductsMock = jest
  .spyOn(ProductService.prototype, 'getProducts')
  .mockImplementation(() => {
    return mockMethod();
  }); 

describe('getProducts', () => {     
    test('Should return empty array when there is no data', async () => {
        mockMethod.mockReturnValue(null);
        const data = await getProducts();
        expect(data).toEqual(
            {
                "body": "[]",
                "headers": {
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Origin": "*",
                },
                "statusCode": 200,
            }
        );
        expect(getProductsMock).toHaveBeenCalled();
    })

    test('Should return correct data for when data is available', async () => {
        mockMethod.mockReturnValue([{ name: 'abc' }, { name: 'abc2' } ]);
        const data = await getProducts();
        expect(data).toEqual(
            {
                "body": JSON.stringify([{ name: 'abc' }, { name: 'abc2' } ]),
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

