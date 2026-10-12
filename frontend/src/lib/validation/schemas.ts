import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer"),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["user", "seller"]),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
export type SignupValues = z.infer<typeof signupSchema>;

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{7,20}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your street address"),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state / region"),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9\- ]{3,10}$/, "Enter a valid postal code"),
  country: z.string().trim().min(2, "Enter your country"),
});
export type ShippingValues = z.infer<typeof shippingSchema>;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Keep the name under 80 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the product in at least 10 characters")
    .max(500, "Keep the description under 500 characters"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Enter a price greater than 0")
    .refine((v) => Number(v) < 1_000_000, "Price is too high"),
  category: z.string().min(1, "Choose a category"),
  imageUrl: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), "Must be a full http(s) URL"),
});
export type ProductFormValues = z.infer<typeof productSchema>;
