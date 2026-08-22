const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    sellerId: ID
  }

  type Order {
    id: ID!
    productId: ID!
    userId: ID!
    quantity: Int!
    status: String!
  }

  type Account {
    id: ID!
    username: String!
    email: String!
    role: String!
    active: Boolean!
  }

  type RegisterResult {
    message: String!
    userId: ID!
  }

  type AuthPayload {
    token: String!
    userId: ID!
    username: String!
    email: String!
    role: String!
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
    getProducts: [Product]
    getProduct(id: ID!): Product
    getOrders: [Order]
    getOrder(id: ID!): Order
    getSellerOrders: [Order]
    getAccounts: [Account]
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    createProduct(name: String!, description: String!, price: Float!): Product
    createOrder(productId: ID!, userId: ID!, quantity: Int!): Order
    respondToOrder(id: ID!, accept: Boolean!): Order
    register(username: String!, email: String!, password: String!, role: String): RegisterResult
    login(email: String!, password: String!): AuthPayload
    setAccountActive(userId: ID!, active: Boolean!): Account
  }
`;

module.exports = typeDefs;
