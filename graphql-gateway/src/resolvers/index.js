const axios = require('axios');

const resolvers = {
  Query: {
    getUsers: async () => {
      const response = await axios.get(`${process.env.USER_SERVICE_URL}/users`);
      return response.data;
    },
    getUser: async (_, { id }) => {
      const response = await axios.get(`${process.env.USER_SERVICE_URL}/users/${id}`);
      return response.data;
    },
    getProducts: async () => {
      const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/products`);
      return response.data;
    },
    getProduct: async (_, { id }) => {
      const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/products/${id}`);
      return response.data;
    },
    getOrders: async () => {
      const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/orders`);
      return response.data;
    },
    getOrder: async (_, { id }) => {
      const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/orders/${id}`);
      return response.data;
    },
  },
  Mutation: {
    createUser: async (_, { name, email }) => {
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/users`, { name, email });
      return response.data;
    },
    createProduct: async (_, { name, description, price }) => {
      const response = await axios.post(`${process.env.PRODUCT_SERVICE_URL}/products`, { name, description, price });
      return response.data;
    },
    createOrder: async (_, { productId, userId, quantity }, context) => {
      const response = await axios.post(
        `${process.env.ORDER_SERVICE_URL}/orders`,
        { productId, userId, quantity },
        { headers: context.authorization ? { Authorization: context.authorization } : {} }
      );
      return response.data;
    },
    register: async (_, { username, email, password, role }) => {
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/users/register`, { username, email, password, role });
      return response.data;
    },
    login: async (_, { email, password }) => {
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/users/login`, { email, password });
      return response.data;
    },
  },
};

module.exports = resolvers;
