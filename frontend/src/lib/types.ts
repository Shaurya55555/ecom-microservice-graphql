export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
};

export type OrderStatus = "Pending" | "Accepted" | "Rejected";

export type Order = {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: OrderStatus | string;
};

export type Account = {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
};
