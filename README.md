# custome-store-nodejs-backend
Backend for custom store app


# Endpoinds for getProducts and getProductById
- GET - https://tacex7h7eh.execute-api.us-east-1.amazonaws.com/dev/products
- GET - https://tacex7h7eh.execute-api.us-east-1.amazonaws.com/dev/products/{productid}
- POST - https://tacex7h7eh.execute-api.us-east-1.amazonaws.com/dev/product

# Functions
- getProducts: product-service-dev-getProducts
- getProductById: product-service-dev-getProductById
- createProduct: product-service-dev-createProduct

# Command to populate data
- `npm run populate:db:data`