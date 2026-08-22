import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      name
      description
      price
      sellerId
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      description
      price
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
    getOrders {
      id
      productId
      userId
      quantity
      status
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      id
      productId
      userId
      quantity
      status
    }
  }
`;

export const GET_SELLER_ORDERS = gql`
  query GetSellerOrders {
    getSellerOrders {
      id
      productId
      userId
      quantity
      status
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query GetAccounts {
    getAccounts {
      id
      username
      email
      role
      active
    }
  }
`;
