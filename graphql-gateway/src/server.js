const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
require('dotenv').config();

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { authorization: req.headers.authorization || null };
  },
});

// Start the server
const port = process.env.PORT || 4000;

server.listen({ port }).then(({ url }) => {
  console.log(`🚀 GraphQL API Gateway ready at ${url}`);
});
