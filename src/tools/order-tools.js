import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const orderTools = [
      {
        name: "getOrder",
        description: "Get an order by ID",
        schema: {
          id: z.string().describe("The ID of the order to retrieve")
        },
        handler: async ({ id }) => {
          const query = `
            query GetOrder($id: ID!) {
              order(id: $id) {
                id
                name
                email
                phone
                createdAt
                displayFinancialStatus
                displayFulfillmentStatus
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                subtotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalShippingPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalTaxSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                customer {
                  id
                  firstName
                  lastName
                  email
                }
                shippingAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      title
                      quantity
                      variant {
                        id
                        title
                        sku
                      }
                      originalTotalSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
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
              content: [{ type: "text", text: `Error retrieving order: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.order) {
            return {
              content: [{ type: "text", text: `Order with ID ${id} not found` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.order, null, 2) }]
          };
        }
      },
      {
        name: "listOrders",
        description: "List orders with pagination",
        schema: {
          first: z.number().optional().default(10).describe("Number of orders to retrieve"),
          after: z.string().optional().describe("Cursor for pagination"),
          query: z.string().optional().describe("Search query to filter orders")
        },
        handler: async ({ first, after, query }) => {
          const gqlQuery = `
            query ListOrders($first: Int!, $after: String, $query: String) {
              orders(first: $first, after: $after, query: $query) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    id
                    name
                    createdAt
                    displayFinancialStatus
                    displayFulfillmentStatus
                    totalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    customer {
                      firstName
                      lastName
                      email
                    }
                  }
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(gqlQuery, { first, after, query });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error listing orders: ${result.error}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.orders, null, 2) }]
          };
        }
      },
      {
        name: "cancelOrder",
        description: "Cancel an order",
        schema: {
          id: z.string().describe("The ID of the order to cancel")
        },
        handler: async ({ id }) => {
          const mutation = `
            mutation CancelOrder($id: ID!) {
              orderCancel(input: { id: $id }) {
                order {
                  id
                  displayFinancialStatus
                  displayFulfillmentStatus
                }
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
              content: [{ type: "text", text: `Error canceling order: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.orderCancel.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error canceling order: ${JSON.stringify(result.data.orderCancel.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.orderCancel.order, null, 2) }]
          };
        }
      }
    ];
