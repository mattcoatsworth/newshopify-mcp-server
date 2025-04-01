import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const discountTools = [
      {
        name: "getDiscount",
        description: "Get a discount by ID",
        schema: {
          id: z.string().describe("The ID of the discount to retrieve")
        },
        handler: async ({ id }) => {
          const query = `
            query GetDiscount($id: ID!) {
              codeDiscountNode(id: $id) {
                id
                codeDiscount {
                  ... on DiscountCodeBasic {
                    title
                    summary
                    status
                    codes(first: 1) {
                      edges {
                        node {
                          code
                        }
                      }
                    }
                    startsAt
                    endsAt
                    customerSelection {
                      ... on DiscountCustomerAll {
                        allCustomers
                      }
                    }
                    customerGets {
                      value {
                        ... on DiscountPercentage {
                          percentage
                        }
                        ... on DiscountAmount {
                          amount {
                            amount
                            currencyCode
                          }
                        }
                      }
                      items {
                        ... on DiscountProducts {
                          products(first: 5) {
                            edges {
                              node {
                                id
                                title
                              }
                            }
                          }
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
              content: [{ type: "text", text: `Error retrieving discount: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.codeDiscountNode) {
            return {
              content: [{ type: "text", text: `Discount with ID ${id} not found` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.codeDiscountNode, null, 2) }]
          };
        }
      },
      {
        name: "createDiscount",
        description: "Create a basic discount code",
        schema: {
          input: z.object({
            title: z.string().describe("Title of the discount"),
            code: z.string().describe("Discount code that customers will enter"),
            discountType: z.enum(["percentage", "amount"]).describe("Type of discount (percentage or fixed amount)"),
            value: z.number().describe("Discount value (percentage or amount)"),
            startsAt: z.string().describe("Start date in ISO format"),
            endsAt: z.string().optional().describe("End date in ISO format (optional)")
          }).describe("Discount creation input")
        },
        handler: async ({ input }) => {
          // Construct the appropriate discount value based on type
          let discountValue;
          if (input.discountType === "percentage") {
            discountValue = {
              percentageValue: input.value
            };
          } else {
            discountValue = {
              fixedAmountValue: {
                amount: input.value
              }
            };
          }

          const mutation = `
            mutation CreateDiscount($basicCodeDiscount: DiscountCodeBasicInput!) {
              discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                codeDiscountNode {
                  id
                  codeDiscount {
                    ... on DiscountCodeBasic {
                      title
                      codes(first: 1) {
                        edges {
                          node {
                            code
                          }
                        }
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

          const basicCodeDiscount = {
            title: input.title,
            code: input.code,
            startsAt: input.startsAt,
            endsAt: input.endsAt || null,
            customerSelection: {
              all: true
            },
            customerGets: {
              value: discountValue,
              items: {
                all: true
              }
            }
          };

          const result = await shopifyClient.executeQuery(mutation, { basicCodeDiscount });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error creating discount: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.discountCodeBasicCreate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error creating discount: ${JSON.stringify(result.data.discountCodeBasicCreate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.discountCodeBasicCreate.codeDiscountNode, null, 2) }]
          };
        }
      },
      {
        name: "deleteDiscount",
        description: "Delete a discount",
        schema: {
          id: z.string().describe("The ID of the discount to delete")
        },
        handler: async ({ id }) => {
          const mutation = `
            mutation DeleteDiscount($id: ID!) {
              discountCodeDelete(id: $id) {
                deletedCodeDiscountId
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
              content: [{ type: "text", text: `Error deleting discount: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.discountCodeDelete.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error deleting discount: ${JSON.stringify(result.data.discountCodeDelete.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: `Discount with ID ${result.data.discountCodeDelete.deletedCodeDiscountId} was successfully deleted.` }]
          };
        }
      }
    ];
