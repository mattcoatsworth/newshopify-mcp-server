import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const inventoryTools = [
      {
        name: "getInventoryItem",
        description: "Get an inventory item by ID",
        schema: {
          id: z.string().describe("The ID of the inventory item to retrieve")
        },
        handler: async ({ id }) => {
          const query = `
            query GetInventoryItem($id: ID!) {
              inventoryItem(id: $id) {
                id
                sku
                tracked
                createdAt
                updatedAt
                inventoryLevels(first: 10) {
                  edges {
                    node {
                      id
                      available
                      location {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(query, { id });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error retrieving inventory item: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.inventoryItem) {
            return {
              content: [{ type: "text", text: `Inventory item with ID ${id} not found` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.inventoryItem, null, 2) }]
          };
        }
      },
      {
        name: "adjustInventory",
        description: "Adjust inventory levels",
        schema: {
          inventoryLevelId: z.string().describe("The ID of the inventory level to adjust"),
          availableDelta: z.number().describe("The change in available quantity (positive or negative)")
        },
        handler: async ({ inventoryLevelId, availableDelta }) => {
          const mutation = `
            mutation AdjustInventory($inventoryLevelId: ID!, $availableDelta: Int!) {
              inventoryAdjustQuantity(input: {
                inventoryLevelId: $inventoryLevelId,
                availableDelta: $availableDelta
              }) {
                inventoryLevel {
                  id
                  available
                  item {
                    id
                    sku
                  }
                  location {
                    id
                    name
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(mutation, { inventoryLevelId, availableDelta });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error adjusting inventory: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.inventoryAdjustQuantity.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error adjusting inventory: ${JSON.stringify(result.data.inventoryAdjustQuantity.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.inventoryAdjustQuantity.inventoryLevel, null, 2) }]
          };
        }
      },
      {
        name: "getInventoryLevel",
        description: "Get inventory level for a location and item",
        schema: {
          inventoryItemId: z.string().describe("The ID of the inventory item"),
          locationId: z.string().describe("The ID of the location")
        },
        handler: async ({ inventoryItemId, locationId }) => {
          const query = `
            query GetInventoryLevel($inventoryItemId: ID!, $locationId: ID!) {
              inventoryLevel(inventoryItemId: $inventoryItemId, locationId: $locationId) {
                id
                available
                item {
                  id
                  sku
                }
                location {
                  id
                  name
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(query, { inventoryItemId, locationId });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error retrieving inventory level: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.inventoryLevel) {
            return {
              content: [{ type: "text", text: `Inventory level not found for the specified item and location` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.inventoryLevel, null, 2) }]
          };
        }
      }
    ];
