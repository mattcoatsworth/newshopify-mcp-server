import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const productTools = [
      {
        name: "getProduct",
        description: "Get a product by ID",
        schema: {
          id: z.string().describe("The ID of the product to retrieve")
        },
        handler: async ({ id }) => {
          const query = `
            query GetProduct($id: ID!) {
              product(id: $id) {
                id
                title
                description
                handle
                productType
                vendor
                status
                createdAt
                updatedAt
                tags
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 10) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(query, { id });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error retrieving product: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.product) {
            return {
              content: [{ type: "text", text: `Product with ID ${id} not found` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.product, null, 2) }]
          };
        }
      },
      {
        name: "listProducts",
        description: "List products with pagination",
        schema: {
          first: z.number().optional().default(10).describe("Number of products to retrieve"),
          after: z.string().optional().describe("Cursor for pagination"),
          query: z.string().optional().describe("Search query to filter products")
        },
        handler: async ({ first, after, query }) => {
          const gqlQuery = `
            query ListProducts($first: Int!, $after: String, $query: String) {
              products(first: $first, after: $after, query: $query) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    id
                    title
                    handle
                    productType
                    vendor
                    status
                    createdAt
                    priceRangeV2 {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(gqlQuery, { first, after, query });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error listing products: ${result.error}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.products, null, 2) }]
          };
        }
      },
      {
        name: "createProduct",
        description: "Create a new product",
        schema: {
          input: z.object({
            title: z.string().describe("Product title"),
            descriptionHtml: z.string().optional().describe("Product description in HTML"),
            productType: z.string().optional().describe("Type of product"),
            vendor: z.string().optional().describe("Product vendor"),
            tags: z.array(z.string()).optional().describe("Product tags"),
            variants: z.array(z.object({
              price: z.string().describe("Variant price"),
              sku: z.string().optional().describe("Variant SKU"),
              inventoryQuantity: z.number().optional().describe("Inventory quantity"),
              title: z.string().optional().describe("Variant title")
            })).optional().describe("Product variants")
          }).describe("Product creation input")
        },
        handler: async ({ input }) => {
          const mutation = `
            mutation CreateProduct($input: ProductInput!) {
              productCreate(input: $input) {
                product {
                  id
                  title
                  handle
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(mutation, { input });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error creating product: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.productCreate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error creating product: ${JSON.stringify(result.data.productCreate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.productCreate.product, null, 2) }]
          };
        }
      },
      {
        name: "updateProduct",
        description: "Update an existing product",
        schema: {
          id: z.string().describe("The ID of the product to update"),
          input: z.object({
            title: z.string().optional().describe("Product title"),
            descriptionHtml: z.string().optional().describe("Product description in HTML"),
            productType: z.string().optional().describe("Type of product"),
            vendor: z.string().optional().describe("Product vendor"),
            tags: z.array(z.string()).optional().describe("Product tags")
          }).describe("Product update input")
        },
        handler: async ({ id, input }) => {
          const mutation = `
            mutation UpdateProduct($id: ID!, $input: ProductInput!) {
              productUpdate(input: { id: $id, ...input }) {
                product {
                  id
                  title
                  handle
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(mutation, { id, input });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error updating product: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.productUpdate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error updating product: ${JSON.stringify(result.data.productUpdate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.productUpdate.product, null, 2) }]
          };
        }
      },
      {
        name: "deleteProduct",
        description: "Delete a product",
        schema: {
          id: z.string().describe("The ID of the product to delete")
        },
        handler: async ({ id }) => {
          const mutation = `
            mutation DeleteProduct($id: ID!) {
              productDelete(input: { id: $id }) {
                deletedProductId
                userErrors {
                  field
                  message
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(mutation, { id });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error deleting product: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.productDelete.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error deleting product: ${JSON.stringify(result.data.productDelete.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: `Product with ID ${result.data.productDelete.deletedProductId} was successfully deleted.` }]
          };
        }
      }
    ];
