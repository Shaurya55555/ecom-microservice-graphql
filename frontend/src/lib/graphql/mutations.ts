import { gql } from "@apollo/client";

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      message
      userId
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      userId
      username
      email
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($productId: ID!, $userId: ID!, $quantity: Int!) {
    createOrder(productId: $productId, userId: $userId, quantity: $quantity) {
      id
      productId
      userId
      quantity
      status
    }
  }
`;
