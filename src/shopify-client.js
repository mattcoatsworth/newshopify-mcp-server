import { GraphQLClient } from 'graphql-request';

    // Create a GraphQL client for Shopify Admin API
    const createShopifyClient = () => {
      const shopName = process.env.SHOPIFY_SHOP_NAME;
      const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

      if (!shopName || !accessToken) {
        throw new Error('Missing Shopify credentials. Please set SHOPIFY_SHOP_NAME and SHOPIFY_ACCESS_TOKEN environment variables.');
      }

      const endpoint = `https://${shopName}.myshopify.com/admin/api/2023-10/graphql.json`;
      
      const client = new GraphQLClient(endpoint, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      return client;
    };

    // Lazy-load the client to ensure environment variables are loaded
    let client;
    const getClient = () => {
      if (!client) {
        try {
          client = createShopifyClient();
        } catch (error) {
          console.error('Error creating Shopify client:', error.message);
          throw error;
        }
      }
      return client;
    };

    // Execute a GraphQL query or mutation
    const executeQuery = async (query, variables = {}) => {
      try {
        const client = getClient();
        const data = await client.request(query, variables);
        return { success: true, data };
      } catch (error) {
        console.error('Shopify API Error:', error.message);
        return { 
          success: false, 
          error: error.message,
          details: error.response?.errors || []
        };
      }
    };

    export const shopifyClient = {
      executeQuery
    };
