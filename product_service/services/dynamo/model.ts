export type ProductSchema = {
    id: string;
    title: string;
    description: string;
    price: number;
}

export type StockSchema = {
    product_id: string;
    count: number;
}

export type ItemSchema = ProductSchema & Omit<StockSchema, 'product_id'>;
