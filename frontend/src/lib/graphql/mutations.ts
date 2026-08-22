import { gql } from "@apollo/client";

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $role: String) {
    register(username: $username, email: $email, password: $password, role: $role) {
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
      role
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($name: String!, $description: String!, $price: Float!) {
    createProduct(name: $name, description: $description, price: $price) {
      id
      name
      description
      price
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

export const RESPOND_TO_ORDER = gql`
  mutation RespondToOrder($id: ID!, $accept: Boolean!) {
    respondToOrder(id: $id, accept: $accept) {
      id
      status
    }
  }
`;

export const SET_ACCOUNT_ACTIVE = gql`
  mutation SetAccountActive($userId: ID!, $active: Boolean!) {
    setAccountActive(userId: $userId, active: $active) {
      id
      active
    }
  }
`;
