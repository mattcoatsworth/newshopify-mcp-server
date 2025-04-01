import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const metafieldTools = [
      {
        name: "getMetafield",
        description: "Get a metafield by ID",
        schema: {
          id: z.string().describe("The ID of the metafield to retrieve")
        },
        handler: async ({ id }) => {
          const query = `
            query GetMetafield($id: ID!) {
              metafield(id: $id) {
                id
                namespace
                key
                value
                type
                createdAt
                updatedAt
                description
              }
            }
          `;

          const result = await shopifyClient.executeQuery(query, { id });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error retrieving metafield: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.metafield) {
            return {
              content: [{ type: "text", text: `Metafield with ID ${id} not found` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.metafield, null, 2) }]
          };
        }
      },
      {
        name: "createProductMetafield",
        description: "Create a metafield for a product",
        schema: {
          productId: z.string().describe("The ID of the product"),
          namespace: z.string().describe("Metafield namespace"),
          key: z.string().describe("Metafield key"),
          value: z.string().describe("Metafield value"),
          type: z.string().describe("Metafield type (e.g., single_line_text_field, multi_line_text_field, number_integer)")
        },
        handler: async ({ productId, namespace, key, value, type }) => {
          const mutation = `
            mutation CreateProductMetafield($input: ProductInput!) {
              productUpdate(input: $input) {
                product {
                  id
                  metafields(first: 1, namespace: $namespace, keys: [$key]) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                        type
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

          const input = {
            id: productId,
            metafields: [
              {
                namespace,
                key,
                value,
                type
              }
            ]
          };

          const result = await shopifyClient.executeQuery(mutation, { input, namespace, key });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error creating metafield: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.productUpdate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error creating metafield: ${JSON.stringify(result.data.productUpdate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.productUpdate.product.metafields.edges[0]?.node || "Metafield created but not returned", null, 2) }]
          };
        }
      },
      {
        name: "deleteMetafield",
        description: "Delete a metafield",
        schema: {
          id: z.string().describe("The ID of the metafield to delete")
        },
        handler: async ({ id }) => {
          const mutation = `
            mutation DeleteMetafield($input: MetafieldDeleteInput!) {
              metafieldDelete(input: $input) {
                deletedId
                userErrors {
                  field
                  message
                }
              }
            }
          `;

          const input = { id };

          const result = await shopifyClient.executeQuery(mutation, { input });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error deleting metafield: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.metafieldDelete.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error deleting metafield: ${JSON.stringify(result.data.metafieldDelete.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: `Metafield with ID ${result.data.metafieldDelete.deletedId} was successfully deleted.` }]
          };
        }
      }
    ];
