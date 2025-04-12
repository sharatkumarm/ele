import { products, type Product, type InsertProduct, cartItems, type CartItem, type InsertCartItem, orders, type Order, type InsertOrder, users, type User, type InsertUser, productWithQuantitySchema, type ProductWithQuantity, complaints, type Complaint, type InsertComplaint } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Memory store for sessions
const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewArrivals(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<ProductWithQuantity[]>;
  getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderStats(): Promise<{totalOrders: number, totalRevenue: number, pendingOrders: number}>;
  
  // Complaint methods
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  getComplaintsBySessionId(sessionId: string): Promise<Complaint[]>;
  getAllComplaints(): Promise<Complaint[]>;
  getComplaintById(id: number): Promise<Complaint | undefined>;
  updateComplaintStatus(id: number, status: string, response?: string): Promise<Complaint | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private complaints: Map<number, Complaint>;
  
  sessionStore: session.Store;
  
  currentUserId: number;
  currentProductId: number;
  currentCartItemId: number;
  currentOrderId: number;
  currentComplaintId: number;

  constructor() {
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.complaints = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;
    this.currentComplaintId = 1;
    
    // Initialize with sample products
    this.initializeProducts();
    
    // Initialize admin user with proper hashed password
    const adminPassword = "$2a$10$XQGxIbNwGwgYQhGZoZpIEOEcl3YyZmCnlbXvGpgBqC3gWgVUAQeDK"; // admin123
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: adminPassword
    });
    this.currentUserId = 2; // Start user IDs after admin
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }
  
  async getNewArrivals(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isNew
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowerCaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery) ||
        product.category.toLowerCase().includes(lowerCaseQuery)
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  
  // Cart methods
  async getCartItems(sessionId: string): Promise<ProductWithQuantity[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
    
    const result: ProductWithQuantity[] = [];
    
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        const productWithQuantity = {
          ...product,
          quantity: item.quantity,
        };
        result.push(productWithQuantity);
      }
    }
    
    return result;
  }
  
  async getCartItem(sessionId: string, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.sessionId === sessionId && item.productId === productId
    );
  }
  
  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.getCartItem(
      insertItem.sessionId as string, 
      insertItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead of creating new
      return this.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + (insertItem.quantity || 1)
      ) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const createdAt = new Date();
    const item: CartItem = { ...insertItem, id, createdAt };
    this.cartItems.set(id, item);
    return item;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    const updatedItem: CartItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(sessionId: string): Promise<boolean> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId
    );
    
    for (const item of items) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
  
  // Order methods
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const status = "pending";
    const order: Order = { ...insertOrder, id, status, createdAt };
    this.orders.set(id, order);
    return order;
  }
  
  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.sessionId === sessionId
    );
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrderStats(): Promise<{totalOrders: number, totalRevenue: number, pendingOrders: number}> {
    const allOrders = Array.from(this.orders.values());
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = allOrders.filter(order => order.status === "pending").length;
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders
    };
  }
  
  // Complaint methods
  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const id = this.currentComplaintId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const status = "open";
    const response = null; // Initialize with null
    const complaint: Complaint = { 
      ...insertComplaint, 
      id, 
      status, 
      createdAt,
      updatedAt,
      response
    };
    this.complaints.set(id, complaint);
    return complaint;
  }
  
  async getComplaintsBySessionId(sessionId: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(
      (complaint) => complaint.sessionId === sessionId
    );
  }
  
  async getAllComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }
  
  async getComplaintById(id: number): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }
  
  async updateComplaintStatus(id: number, status: string, response?: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    // Convert undefined to null for response
    const responseValue = response === undefined ? complaint.response : response;
    
    const updatedComplaint: Complaint = { 
      ...complaint, 
      status,
      response: responseValue,
      updatedAt: new Date() 
    };
    
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }
  
  // Initialize with sample products
  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "iPhone 13 Pro",
        description: "The latest iPhone with A15 Bionic chip, 128GB, Sierra Blue, triple-camera system",
        price: 99999,
        oldPrice: 109999,
        category: "Smartphones",
        imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        reviewCount: 124,
        stock: 10,
        features: ["A15 Bionic chip", "128GB storage", "Triple-camera system", "ProMotion display"],
        badges: ["New"],
        isNew: true,
        isFeatured: true
      },
      {
        name: "MacBook Pro",
        description: "Powerful laptop with M1 Pro chip, 16GB RAM, 512GB SSD, 14-inch Retina display",
        price: 149999,
        oldPrice: 169999,
        category: "Laptops",
        imageUrl: "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=800&q=80",
        rating: 5,
        reviewCount: 89,
        stock: 5,
        features: ["M1 Pro chip", "16GB RAM", "512GB SSD", "14-inch Retina display"],
        badges: ["Sale"],
        isNew: false,
        isFeatured: true
      },
      {
        name: "Sony WH-1000XM4",
        description: "Premium wireless noise-cancelling headphones with industry-leading technology",
        price: 24999,
        oldPrice: 29999,
        category: "Audio",
        imageUrl: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&w=800&q=80",
        rating: 5,
        reviewCount: 215,
        stock: 15,
        features: ["Industry-leading noise cancellation", "30-hour battery life", "Touch controls", "Speak-to-chat technology"],
        badges: [],
        isNew: false,
        isFeatured: true
      },
      {
        name: "Galaxy Watch 4",
        description: "Advanced smartwatch with health monitoring, GPS, and fitness tracking features",
        price: 19999,
        oldPrice: 22999,
        category: "Wearables",
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
        rating: 4,
        reviewCount: 76,
        stock: 8,
        features: ["Health monitoring", "GPS", "Fitness tracking", "44mm size"],
        badges: ["Popular"],
        isNew: false,
        isFeatured: true
      },
      {
        name: "Samsung QLED TV",
        description: "55-inch 4K Ultra HD Smart TV with Quantum Processor and HDR",
        price: 84999,
        oldPrice: null,
        category: "Televisions",
        imageUrl: "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?auto=format&fit=crop&w=800&q=80",
        rating: 4,
        reviewCount: 32,
        stock: 3,
        features: ["4K Ultra HD", "Quantum Processor", "HDR", "Smart TV"],
        badges: ["New"],
        isNew: true,
        isFeatured: false
      },
      {
        name: "iPad Air",
        description: "Powerful and versatile tablet with M1 chip, 64GB storage, and Wi-Fi connectivity",
        price: 54999,
        oldPrice: null,
        category: "Tablets",
        imageUrl: "https://images.unsplash.com/photo-1600086827875-a63b01f1335c?auto=format&fit=crop&w=800&q=80",
        rating: 4.5,
        reviewCount: 47,
        stock: 12,
        features: ["M1 chip", "10.9-inch display", "64GB storage", "Wi-Fi"],
        badges: ["New"],
        isNew: true,
        isFeatured: false
      },
      {
        name: "Google Nest Hub",
        description: "Smart home display with Google Assistant for controlling your smart home devices",
        price: 7999,
        oldPrice: null,
        category: "Smart Home",
        imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
        rating: 5,
        reviewCount: 19,
        stock: 7,
        features: ["Google Assistant", "Smart home controls", "7-inch display", "Video calls"],
        badges: ["New"],
        isNew: true,
        isFeatured: false
      },
      {
        name: "Samsung Galaxy Buds Pro",
        description: "True wireless earbuds with active noise cancellation and immersive sound",
        price: 12999,
        oldPrice: null,
        category: "Audio",
        imageUrl: "https://images.unsplash.com/photo-1628815113969-0484d74e6df2?auto=format&fit=crop&w=800&q=80",
        rating: 4,
        reviewCount: 24,
        stock: 9,
        features: ["Active noise cancellation", "360 Audio", "IPX7 water resistance", "8-hour battery life"],
        badges: ["New"],
        isNew: true,
        isFeatured: false
      },
      {
        name: "Canon EOS R5",
        description: "Professional mirrorless camera with 45MP full-frame sensor and 8K video recording",
        price: 339999,
        oldPrice: 359999,
        category: "Cameras",
        imageUrl: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        reviewCount: 56,
        stock: 2,
        features: ["45MP full-frame sensor", "8K video", "In-body image stabilization", "Dual Pixel CMOS AF"],
        badges: [],
        isNew: false,
        isFeatured: false
      },
      {
        name: "Dell XPS 13",
        description: "Ultra-thin laptop with InfinityEdge display, 11th Gen Intel Core i7, and 16GB RAM",
        price: 129999,
        oldPrice: 139999,
        category: "Laptops",
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
        rating: 4.7,
        reviewCount: 102,
        stock: 6,
        features: ["11th Gen Intel Core i7", "16GB RAM", "512GB SSD", "InfinityEdge display"],
        badges: [],
        isNew: false,
        isFeatured: false
      },
      {
        name: "Bose QuietComfort Earbuds",
        description: "True wireless noise cancelling earbuds with high-fidelity audio and secure fit",
        price: 21999,
        oldPrice: 24999,
        category: "Audio",
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
        rating: 4.6,
        reviewCount: 83,
        stock: 11,
        features: ["Noise cancellation", "High-fidelity audio", "Secure fit", "Weather-resistant"],
        badges: ["Sale"],
        isNew: false,
        isFeatured: false
      },
      {
        name: "LG 34-inch UltraWide Monitor",
        description: "Professional curved monitor with 34-inch UltraWide QHD display and HDR 10",
        price: 49999,
        oldPrice: 54999,
        category: "Monitors",
        imageUrl: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&w=800&q=80",
        rating: 4.4,
        reviewCount: 37,
        stock: 4,
        features: ["34-inch UltraWide QHD", "HDR 10", "AMD FreeSync", "Curved display"],
        badges: [],
        isNew: false,
        isFeatured: false
      }
    ];
    
    sampleProducts.forEach((product) => {
      this.createProduct(product);
    });
  }
}

export const storage = new MemStorage();
