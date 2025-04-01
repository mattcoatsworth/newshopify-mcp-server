# Shopify Admin GraphQL MCP Server

    A comprehensive Model Context Protocol (MCP) server for interacting with Shopify's Admin GraphQL API. This server provides tools and resources for managing products, orders, customers, inventory, discounts, metafields, and shop information.

    ## Features

    - Complete coverage of key Shopify Admin API functionality
    - Structured tools for all major Shopify resources
    - Documentation resources for each API section
    - Easy to use with any MCP-compatible client

    ## Setup

    1. Clone this repository
    2. Install dependencies:
       ```
       npm install
       ```
    3. Create a `.env` file with your Shopify credentials:
       ```
       SHOPIFY_SHOP_NAME=your-shop-name
       SHOPIFY_ACCESS_TOKEN=your-access-token
       ```

    ## Usage

    Start the server:
    ```
    npm run dev
    ```

    Test with MCP Inspector:
    ```
    npm run inspect
    ```

    ## Available Tools

    ### Products
    - getProduct: Get a product by ID
    - listProducts: List products with pagination
    - createProduct: Create a new product
    - updateProduct: Update an existing product
    - deleteProduct: Delete a product

    ### Orders
    - getOrder: Get an order by ID
    - listOrders: List orders with pagination
    - cancelOrder: Cancel an order

    ### Customers
    - getCustomer: Get a customer by ID
    - listCustomers: List customers with pagination
    - createCustomer: Create a new customer
    - updateCustomer: Update an existing customer
    - deleteCustomer: Delete a customer

    ### Inventory
    - getInventoryItem: Get an inventory item by ID
    - adjustInventory: Adjust inventory levels
    - getInventoryLevel: Get inventory level for a location and item

    ### Discounts
    - getDiscount: Get a discount by ID
    - createDiscount: Create a basic discount code
    - deleteDiscount: Delete a discount

    ### Metafields
    - getMetafield: Get a metafield by ID
    - createProductMetafield: Create a metafield for a product
    - deleteMetafield: Delete a metafield

    ### Shop
    - getShopInfo: Get information about your shop
    - updateShopInfo: Update shop information

    ## Documentation Resources

    Access documentation via the `shopify://docs/{section}` resource, where section can be:
    - overview
    - products
    - orders
    - customers
    - inventory
    - discounts
    - metafields
    - shop

    ## Authentication

    This server requires a Shopify Admin API access token. You can create one in your Shopify admin under Apps > Develop apps.
