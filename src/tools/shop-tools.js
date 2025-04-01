import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const shopTools = [
      {
        name: "getShopInfo",
        description: "Get information about your shop",
        schema: {},
        handler: async () => {
          const query = `
            query GetShopInfo {
              shop {
                id
                name
                email
                myshopifyDomain
                primaryDomain {
                  url
                  host
                }
                plan {
                  displayName
                  partnerDevelopment
                  shopifyPlus
                }
                url
                currencyCode
                billingAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
                contactEmail
                customerAccounts
                description
                enabledPresentmentCurrencies
                ianaTimezone
                marketingUrls {
                  marketing
                  mobileMarketingUrl
                }
                moneyFormat
                weightUnit
              }
            }
          `;

          const result = await shopifyClient.executeQuery(query);
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error retrieving shop information: ${result.error}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.shop, null, 2) }]
          };
        }
      },
      {
        name: "updateShopInfo",
        description: "Update shop information",
        schema: {
          input: z.object({
            name: z.string().optional().describe("Shop name"),
            email: z.string().email().optional().describe("Shop email"),
            contactEmail: z.string().email().optional().describe("Contact email"),
            description: z.string().optional().describe("Shop description"),
            moneyFormat: z.string().optional().describe("Money format")
          }).describe("Shop update input")
        },
        handler: async ({ input }) => {
          const mutation = `
            mutation UpdateShop($input: ShopInput!) {
              shopUpdate(input: $input) {
                shop {
                  id
                  name
                  email
                  contactEmail
                  description
                  moneyFormat
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
              content: [{ type: "text", text: `Error updating shop information: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.shopUpdate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error updating shop information: ${JSON.stringify(result.data.shopUpdate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.shopUpdate.shop, null, 2) }]
          };
        }
      }
    ];
