import { gql } from "@apollo/client";
import { PRODUCT_FIELDS } from "./queries";

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
  ${PRODUCT_FIELDS}
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: Float!
    $category: String
    $imageUrl: String
  ) {
    createProduct(
      name: $name
      description: $description
      price: $price
      category: $category
      imageUrl: $imageUrl
    ) {
      ...ProductFields
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $price: Float
    $category: String
    $imageUrl: String
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      price: $price
      category: $category
      imageUrl: $imageUrl
    ) {
      ...ProductFields
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
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
