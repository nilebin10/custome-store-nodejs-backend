import { ProductSeeder, StockSeeder } from './dynamo-helpers';
import path from 'path';
import fs from 'fs';

export default class UpdateTable {
    private productSeeder: ProductSeeder;
    private stockSeeder: StockSeeder;
    constructor() {
        this.productSeeder = new ProductSeeder();
        this.stockSeeder = new StockSeeder();
    }

    async populateData(){
        const product_data_path = path.resolve(__dirname, '../../data/products.json');
        const stock_data_path = path.resolve(__dirname, '../../data/stocks.json');

        const product_data = JSON.parse(fs.readFileSync(product_data_path, 'utf-8'));
        const stock_data = JSON.parse(fs.readFileSync(stock_data_path, 'utf-8'));

        console.log(stock_data);

        return await Promise.all([this.productSeeder.dbSeeder.populateTable(product_data),
            this.stockSeeder.dbSeeder.populateTable(stock_data)]);
    }
}

const updateTable = new UpdateTable();

updateTable.populateData().then(() => {
    console.log('Going to populate data');
}).catch((err) => {
    console.log(err)
})