import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { shopifyClient } from './shopify-client.js';
    import { productTools } from './tools/product-tools.js';
    import { orderTools } from './tools/order-tools.js';
    import { customerTools } from './tools/customer-tools.js';
    import { inventoryTools } from './tools/inventory-tools.js';
    import { discountTools } from './tools/discount-tools.js';
    import { metafieldTools } from './tools/metafield-tools.js';
    import { shopTools } from './tools/shop-tools.js';

    // Create an MCP server for Shopify Admin GraphQL API
    const server = new McpServer({
      name: "Shopify Admin GraphQL API",
      version: "1.0.0",
      description: "MCP Server for interacting with Shopify's Admin GraphQL API"
    });

    // Add documentation resource
    server.resource(
      "documentation",
      new ResourceTemplate("shopify://docs/{section}", { list: undefined }),
      async (uri, { section }) => {
        const docs = {
          "overview": `# Shopify Admin GraphQL API

This MCP server provides access to Shopify's Admin GraphQL API. It allows you to manage products, orders, customers, inventory, and more.

## Authentication
To use this server, you need to set up the following environment variables:
- SHOPIFY_SHOP_NAME: Your Shopify shop name
- SHOPIFY_ACCESS_TOKEN: Your Shopify Admin API access token

## Available Sections
- products: Product management
- orders: Order management
- customers: Customer management
- inventory: Inventory management
- discounts: Discount management
- metafields: Metafield management
- shop: Shop information`,

          "products": `# Product Management

Tools for managing products in your Shopify store.

## Available Tools
- getProduct: Get a product by ID
- listProducts: List products with pagination
- createProduct: Create a new product
- updateProduct: Update an existing product
- deleteProduct: Delete a product`,

          "orders": `# Order Management

Tools for managing orders in your Shopify store.

## Available Tools
- getOrder: Get an order by ID
- listOrders: List orders with pagination
- createOrder: Create a new order
- updateOrder: Update an existing order
- cancelOrder: Cancel an order`,

          "customers": `# Customer Management

Tools for managing customers in your Shopify store.

## Available Tools
- getCustomer: Get a customer by ID
- listCustomers: List customers with pagination
- createCustomer: Create a new customer
- updateCustomer: Update an existing customer
- deleteCustomer: Delete a customer`,

          "inventory": `# Inventory Management

Tools for managing inventory in your Shopify store.

## Available Tools
- getInventoryItem: Get an inventory item by ID
- adjustInventory: Adjust inventory levels
- getInventoryLevel: Get inventory level for a location and item`,

          "discounts": `# Discount Management

Tools for managing discounts in your Shopify store.

## Available Tools
- getDiscount: Get a discount by ID
- createDiscount: Create a new discount
- updateDiscount: Update an existing discount
- deleteDiscount: Delete a discount`,

          "metafields": `# Metafield Management

Tools for managing metafields in your Shopify store.

## Available Tools
- getMetafield: Get a metafield by ID
- createMetafield: Create a new metafield
- updateMetafield: Update an existing metafield
- deleteMetafield: Delete a metafield`,

          "shop": `# Shop Information

Tools for retrieving and managing shop information.

## Available Tools
- getShopInfo: Get information about your shop
- updateShopInfo: Update shop information`
        };

        const content = docs[section] || "Documentation section not found. Available sections: overview, products, orders, customers, inventory, discounts, metafields, shop";

        return {
          contents: [{
            uri: uri.href,
            text: content
          }]
        };
      }
    );

    // Register all tools
    productTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    orderTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    customerTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    inventoryTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    discountTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    metafieldTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    shopTools.forEach(tool => {
      server.tool(
        tool.name,
        tool.schema,
        tool.handler,
        { description: tool.description }
      );
    });

    export { server };
