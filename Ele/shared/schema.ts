import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the original user table)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  oldPrice: doublePrecision("old_price"),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  imageUrl: text("image_url").notNull(),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  stock: integer("stock").notNull().default(0),
  features: text("features").array(),
  badges: text("badges").array(),
  isNew: boolean("is_new").default(false),
  isFeatured: boolean("is_featured").default(false),
});

export const insertProductSchema = createInsertSchema(products, {
  price: z.number().positive(),
  oldPrice: z.number().positive().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  features: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
}).omit({ id: true });

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems, {
  quantity: z.number().int().positive(),
}).omit({ id: true, createdAt: true });

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  sessionId: text("session_id"),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  total: doublePrecision("total").notNull(),
  paymentMethod: text("payment_method").notNull().default("cod"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  items: json("items").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders, {
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  total: z.number().positive(),
  paymentMethod: z.enum(["cod", "card", "upi"]).default("cod"),
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ),
}).omit({ id: true, status: true, createdAt: true });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Additional schemas for API responses
export const productWithQuantitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  oldPrice: z.number().optional(),
  category: z.string(),
  subcategory: z.string().optional(),
  imageUrl: z.string(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  stock: z.number(),
  features: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  quantity: z.number().int().positive(),
});

export type ProductWithQuantity = z.infer<typeof productWithQuantitySchema>;

// Complaint schema
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  orderNumber: text("order_number"),
  attachment: text("attachment"),
  attachmentName: text("attachment_name"),
  status: text("status").default("open").notNull(),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertComplaintSchema = createInsertSchema(complaints, {
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  subject: z.string().min(5),
  description: z.string().min(20)
}).omit({ id: true, createdAt: true, updatedAt: true, status: true, response: true });

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
