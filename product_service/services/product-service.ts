import { ProductSchema, StockSchema, ItemSchema } from './dynamo/model';
import { STATUS_CODE } from ".";
import { ProductSeeder, StockSeeder } from './dynamo/dynamo-helpers';
import Ajv, { JSONSchemaType } from 'ajv';
import { v4 as uuid } from 'uuid';
import { winstonLogger } from './logger.service';

export class IProductService {
    getProducts!: () => Promise<ItemSchema[]>;
    getProductById!: (id: string) => Promise<any>;
}

type schemaType = Omit<ItemSchema, 'id'>;
const schema: JSONSchemaType<schemaType> = {
    type: "object",
    properties: {
      title: {type: "string", nullable: false},
      description: {type: "string"},
      count: {type:"integer"},
      price: {type:"integer"}
    },
    required: ["title", "price", "count"],
    additionalProperties: false
}
export class ProductService implements IProductService {

    private productSeeder: ProductSeeder;
    private stockSeeder: StockSeeder;
    private validate: any;

    constructor(){
        this.productSeeder = new ProductSeeder();
        this.stockSeeder = new StockSeeder();
        this.validate = new Ajv().compile(schema);
    }

    async getProducts(): Promise<ItemSchema[]> {
        try{
            const products = await this.productSeeder.dbSeeder.getTableData();
            const stocks = await this.stockSeeder.dbSeeder.getTableData();
            let Items:ItemSchema[] = [];

            if(products) {
                Items = products.map((product: ProductSchema) => {
                    const stock = stocks?.find((stock: StockSchema) => { stock.product_id === product.id });
                    return { ...product, count: stock?.count || 0 }
                });
            }
            return Promise.resolve(Items);
        } catch(err){
            return Promise.reject(err);
        }
    }

    async getProductById(id: string) {
        try {
            winstonLogger.logRequest(`Request with id: ${id}`);
            const [ product, stock ] = await Promise.all([this.productSeeder.dbSeeder.getItem(id),
                this.stockSeeder.dbSeeder.getItem(id)])
            if (!product) {
                return Promise.reject({
                    message: 'Product Not found',
                    errCode: STATUS_CODE.NOT_FOUND
                })
            }
            const item:ItemSchema = { ...product, count: stock?.count };
            return Promise.resolve(item);
        } catch(err) {
            const error = {
                message: 'Something Went Wrong',
                errCode: STATUS_CODE.INTERNAL_ERROR
            }
            return Promise.reject(error);
        }
    }

    async createProduct(item: any){
        try{
            const _item = JSON.parse(item as string);
            winstonLogger.logRequest(`Received item:: ${item}`)
            if (this.validate(_item)) {
                const id = uuid();
                const { count, ...product } = _item;
                await Promise.all([
                    this.productSeeder.dbSeeder.createItem({...product, id}),
                    this.stockSeeder.dbSeeder.createItem({count, product_id: id})
                ])
                return Promise.resolve({
                    message: 'Product added successfully',
                    item: { ..._item, id }
                });
            }
            return Promise.reject({
                message: `Send requested data in correct format`,
                errCode: STATUS_CODE.BAD_REQUEST
            })
        }catch(err){
            return Promise.reject(err);
        }
    }
}