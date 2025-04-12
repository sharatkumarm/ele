import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCartItemSchema, insertOrderSchema, productWithQuantitySchema, insertComplaintSchema, insertUserSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { setupAuth } from "./auth";

// Helper function to generate simulated competitor prices
function generateCompetitorPrices(productName: string, ourPrice: number) {
  // Retailers we want to compare with
  const retailers = [
    { name: "Amazon", domain: "amazon.in" },
    { name: "Flipkart", domain: "flipkart.com" },
    { name: "Croma", domain: "croma.com" },
    { name: "Reliance Digital", domain: "reliancedigital.in" }
  ];
  
  // Generate a random price that's typically higher than our price
  // This simulates that we're offering the best deal
  const generatePrice = (basePrice: number): number => {
    // Random price variation from 0% to 25% higher than our price
    const variation = 1 + (Math.random() * 0.25);
    return Math.round(basePrice * variation);
  };
  
  // Check if the product is in stock with a high probability
  const isInStock = (): boolean => {
    return Math.random() > 0.2; // 80% chance of being in stock
  };
  
  // Generate competitor data
  return retailers.map(retailer => {
    const price = generatePrice(ourPrice);
    
    return {
      retailer: retailer.name,
      price: price,
      inStock: isInStock(),
      link: `https://www.${retailer.domain}/search?q=${encodeURIComponent(productName)}`
    };
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // prefix all routes with /api
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  // Get products by category
  app.get("/api/categories/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  
  // Get featured products
  app.get("/api/products/featured/all", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });
  
  // Get new arrivals
  app.get("/api/products/new/all", async (req, res) => {
    try {
      const products = await storage.getNewArrivals();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch new arrivals" });
    }
  });
  
  // Search products
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to search products" });
    }
  });
  
  // Price comparison endpoint
  app.get("/api/price-comparison/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // In a real application, this would connect to APIs or use web scraping
      // For demo purposes, we'll simulate competitor prices
      const competitorPrices = generateCompetitorPrices(product.name, product.price);
      
      res.json(competitorPrices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price comparison" });
    }
  });
  
  // Cart endpoints
  
  // Get cart items
  app.get("/api/cart", async (req, res) => {
    try {
      // Use session cookie to identify cart, or create new one
      let sessionId = req.headers.authorization || req.cookies?.sessionId;
      if (!sessionId) {
        sessionId = randomUUID();
        res.cookie("sessionId", sessionId, { 
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }
      
      const cartItems = await storage.getCartItems(sessionId);
      res.json({
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });
  
  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      // Validate request body
      const validation = insertCartItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid cart item data", errors: validation.error.errors });
      }
      
      // Use session cookie or create new one
      let sessionId = req.headers.authorization || req.cookies?.sessionId;
      if (!sessionId) {
        sessionId = randomUUID();
        res.cookie("sessionId", sessionId, { 
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }
      
      // Check if product exists
      const product = await storage.getProductById(validation.data.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Add to cart with session ID
      const cartItem = await storage.addToCart({
        ...validation.data,
        sessionId
      });
      
      const cartItems = await storage.getCartItems(sessionId);
      
      res.status(201).json({
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  // Update cart item quantity
  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get updated cart
      const sessionId = req.headers.authorization || req.cookies?.sessionId;
      const cartItems = await storage.getCartItems(sessionId as string);
      
      res.json({
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  // Remove item from cart
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const removed = await storage.removeFromCart(id);
      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get updated cart
      const sessionId = req.headers.authorization || req.cookies?.sessionId;
      const cartItems = await storage.getCartItems(sessionId as string);
      
      res.json({
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        count: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  
  // Clear cart
  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.headers.authorization || req.cookies?.sessionId;
      if (!sessionId) {
        return res.status(400).json({ message: "No session ID provided" });
      }
      
      await storage.clearCart(sessionId as string);
      
      res.json({
        items: [],
        total: 0,
        count: 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      // Validate request body
      const validation = insertOrderSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid order data", errors: validation.error.errors });
      }
      
      const sessionId = req.headers.authorization || req.cookies?.sessionId;
      if (!sessionId) {
        return res.status(400).json({ message: "No session ID provided" });
      }
      
      // Create order
      const order = await storage.createOrder({
        ...validation.data,
        sessionId: sessionId as string
      });
      
      // Clear cart after successful order
      await storage.clearCart(sessionId as string);
      
      res.status(201).json({ 
        orderId: order.id,
        message: "Order placed successfully" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: uploadStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images, PDFs, and documents
      const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.') as any);
      }
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
  
  // Submit a complaint with optional file attachment
  app.post("/api/complaints", upload.single('attachment'), async (req, res) => {
    try {
      // Get file info if uploaded
      const file = req.file;
      const attachment = file ? `/uploads/${file.filename}` : null;
      const attachmentName = file ? file.originalname : null;
      
      // Get session ID
      let sessionId = req.headers.authorization || req.cookies?.sessionId;
      if (!sessionId) {
        sessionId = randomUUID();
        res.cookie("sessionId", sessionId, { 
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }
      
      // Validate and create complaint
      const complaintData = {
        ...req.body,
        sessionId,
        attachment,
        attachmentName
      };
      
      const validation = insertComplaintSchema.safeParse(complaintData);
      if (!validation.success) {
        // Remove file if validation fails
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ 
          message: "Invalid complaint data", 
          errors: validation.error.errors 
        });
      }
      
      const complaint = await storage.createComplaint(validation.data);
      res.status(201).json({
        id: complaint.id,
        message: "Complaint submitted successfully"
      });
    } catch (error) {
      console.error("Complaint submission error:", error);
      res.status(500).json({ message: "Failed to submit complaint" });
    }
  });
  
  // Get user's complaints
  app.get("/api/complaints", async (req, res) => {
    try {
      const sessionId = req.headers.authorization || req.cookies?.sessionId;
      if (!sessionId) {
        return res.status(400).json({ message: "No session ID provided" });
      }
      
      const complaints = await storage.getComplaintsBySessionId(sessionId as string);
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });
  
  // Admin endpoints
  
  // Get all products (admin)
  app.get("/api/admin/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get all orders (admin)
  app.get("/api/admin/orders", async (req, res) => {
    try {
      // In a real app, this would have proper authentication
      // For demo purposes, we're allowing unrestricted access
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get order statistics (admin)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Get all complaints (admin)
  app.get("/api/admin/complaints", async (req, res) => {
    try {
      const complaints = await storage.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });
  
  // Update complaint status (admin)
  app.patch("/api/admin/complaints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
      }
      
      const { status, response } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedComplaint = await storage.updateComplaintStatus(id, status, response);
      if (!updatedComplaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      res.json(updatedComplaint);
    } catch (error) {
      res.status(500).json({ message: "Failed to update complaint" });
    }
  });
  
  /* Authentication now handled by setupAuth()
  
  // User signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Validate request body
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: validation.error.errors 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validation.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validation.data.password, salt);
      
      // Create user with hashed password
      const user = await storage.createUser({
        username: validation.data.username,
        password: hashedPassword
      });
      
      // Return user without password
      res.status(201).json({
        id: user.id,
        username: user.username,
        message: "User created successfully"
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate request
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate session ID
      const sessionId = randomUUID();
      res.cookie("sessionId", sessionId, { 
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      // Get existing cart if any
      const existingCart = await storage.getCartItems(sessionId);
      
      // Return user without password
      res.json({
        id: user.id,
        username: user.username,
        message: "Login successful",
        cart: {
          items: existingCart,
          total: existingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          count: existingCart.reduce((sum, item) => sum + item.quantity, 0)
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  // Guest login (no authentication needed)
  app.post("/api/auth/guest", async (req, res) => {
    try {
      // Generate a new session ID for the guest
      const sessionId = randomUUID();
      
      // Set session cookie
      res.cookie("sessionId", sessionId, { 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day for guests
      });
      
      // Return guest session
      res.json({
        message: "Guest session created",
        isGuest: true,
        cart: {
          items: [],
          total: 0,
          count: 0
        }
      });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Failed to create guest session" });
    }
  });
  */

  const httpServer = createServer(app);

  return httpServer;
}
