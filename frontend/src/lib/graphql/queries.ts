import { gql } from "@apollo/client";

export const PRODUCT_FIELDS = gql`
  fragment ProductFields on Product {
    id
    name
    description
    price
    sellerId
    category
    imageUrl
    createdAt
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_FIELDS}
  query GetProducts {
    getProducts {
      ...ProductFields
    }
  }
`;

export const GET_PRODUCT = gql`
  ${PRODUCT_FIELDS}
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      ...ProductFields
    }
  }
`;

const ORDER_FIELDS = `
  id
  productId
  userId
  quantity
  status
`;

export const GET_ORDERS = gql`
  query GetOrders {
    getOrders {
      ${ORDER_FIELDS}
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`;

export const GET_SELLER_ORDERS = gql`
  query GetSellerOrders {
    getSellerOrders {
      ${ORDER_FIELDS}
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
