import { z } from 'zod';
    import { shopifyClient } from '../shopify-client.js';

    export const customerTools = [
      {
        name: "getCustomer",
        description: "Get a customer by ID",
        schema: {
          id: z.string().describe("The ID of the customer to retrieve")
        },
        handler: async ({ id }) => {
          const query = `
            query GetCustomer($id: ID!) {
              customer(id: $id) {
                id
                firstName
                lastName
                email
                phone
                createdAt
                updatedAt
                defaultAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                  phone
                }
                addresses(first: 10) {
                  edges {
                    node {
                      id
                      address1
                      address2
                      city
                      province
                      country
                      zip
                      phone
                    }
                  }
                }
                orders(first: 5) {
                  edges {
                    node {
                      id
                      name
                      createdAt
                      displayFinancialStatus
                      totalPriceSet {
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
              content: [{ type: "text", text: `Error retrieving customer: ${result.error}` }],
              isError: true
            };
          }

          if (!result.data.customer) {
            return {
              content: [{ type: "text", text: `Customer with ID ${id} not found` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.customer, null, 2) }]
          };
        }
      },
      {
        name: "listCustomers",
        description: "List customers with pagination",
        schema: {
          first: z.number().optional().default(10).describe("Number of customers to retrieve"),
          after: z.string().optional().describe("Cursor for pagination"),
          query: z.string().optional().describe("Search query to filter customers")
        },
        handler: async ({ first, after, query }) => {
          const gqlQuery = `
            query ListCustomers($first: Int!, $after: String, $query: String) {
              customers(first: $first, after: $after, query: $query) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                edges {
                  node {
                    id
                    firstName
                    lastName
                    email
                    phone
                    createdAt
                    ordersCount
                    totalSpent
                  }
                }
              }
            }
          `;

          const result = await shopifyClient.executeQuery(gqlQuery, { first, after, query });
          
          if (!result.success) {
            return {
              content: [{ type: "text", text: `Error listing customers: ${result.error}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.customers, null, 2) }]
          };
        }
      },
      {
        name: "createCustomer",
        description: "Create a new customer",
        schema: {
          input: z.object({
            firstName: z.string().describe("Customer's first name"),
            lastName: z.string().describe("Customer's last name"),
            email: z.string().email().describe("Customer's email address"),
            phone: z.string().optional().describe("Customer's phone number"),
            acceptsMarketing: z.boolean().optional().describe("Whether the customer accepts marketing emails")
          }).describe("Customer creation input")
        },
        handler: async ({ input }) => {
          const mutation = `
            mutation CreateCustomer($input: CustomerInput!) {
              customerCreate(input: $input) {
                customer {
                  id
                  firstName
                  lastName
                  email
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
              content: [{ type: "text", text: `Error creating customer: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.customerCreate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error creating customer: ${JSON.stringify(result.data.customerCreate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.customerCreate.customer, null, 2) }]
          };
        }
      },
      {
        name: "updateCustomer",
        description: "Update an existing customer",
        schema: {
          id: z.string().describe("The ID of the customer to update"),
          input: z.object({
            firstName: z.string().optional().describe("Customer's first name"),
            lastName: z.string().optional().describe("Customer's last name"),
            email: z.string().email().optional().describe("Customer's email address"),
            phone: z.string().optional().describe("Customer's phone number"),
            acceptsMarketing: z.boolean().optional().describe("Whether the customer accepts marketing emails")
          }).describe("Customer update input")
        },
        handler: async ({ id, input }) => {
          const mutation = `
            mutation UpdateCustomer($id: ID!, $input: CustomerInput!) {
              customerUpdate(input: { id: $id, ...input }) {
                customer {
                  id
                  firstName
                  lastName
                  email
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
              content: [{ type: "text", text: `Error updating customer: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.customerUpdate.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error updating customer: ${JSON.stringify(result.data.customerUpdate.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: JSON.stringify(result.data.customerUpdate.customer, null, 2) }]
          };
        }
      },
      {
        name: "deleteCustomer",
        description: "Delete a customer",
        schema: {
          id: z.string().describe("The ID of the customer to delete")
        },
        handler: async ({ id }) => {
          const mutation = `
            mutation DeleteCustomer($id: ID!) {
              customerDelete(input: { id: $id }) {
                deletedCustomerId
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
              content: [{ type: "text", text: `Error deleting customer: ${result.error}` }],
              isError: true
            };
          }

          if (result.data.customerDelete.userErrors.length > 0) {
            return {
              content: [{ type: "text", text: `Error deleting customer: ${JSON.stringify(result.data.customerDelete.userErrors, null, 2)}` }],
              isError: true
            };
          }

          return {
            content: [{ type: "text", text: `Customer with ID ${result.data.customerDelete.deletedCustomerId} was successfully deleted.` }]
          };
        }
      }
    ];
