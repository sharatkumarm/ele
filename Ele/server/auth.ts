import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import twilio from 'twilio';

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
const otpStore = new Map(); // Store OTPs in memory (use Redis in production)

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/auth/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    // Get the user's cart
    const userCart = { items: [], total: 0, count: 0 };
    
    res.status(200).json({
      id: req.user!.id,
      username: req.user!.username,
      message: "Login successful",
      cart: userCart
    });
  });

  // Google OAuth routes - only set up if credentials are present
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUserByEmail(profile.emails![0].value);
      if (!user) {
        user = await storage.createUser({
          username: profile.displayName,
          email: profile.emails![0].value,
          googleId: profile.id
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }));

  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/');
    }
  );
  }

  // Phone authentication routes
  app.post('/api/auth/phone/send-otp', async (req, res) => {
    if (!twilioClient) {
      return res.status(503).json({ message: 'Phone authentication is not configured' });
    }
    
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      await twilioClient.messages.create({
        body: `Your OTP is: ${otp}`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });

      // Store OTP with 5 minute expiry
      otpStore.set(phoneNumber, {
        code: otp,
        expiry: Date.now() + 5 * 60 * 1000
      });

      res.json({ message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      res.status(500).json({ message: 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/phone/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;
    const storedOTP = otpStore.get(phoneNumber);

    if (!storedOTP || storedOTP.expiry < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    if (storedOTP.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP verified, create or get user
    let user = await storage.getUserByPhone(phoneNumber);
    if (!user) {
      user = await storage.createUser({
        username: `user_${phoneNumber.slice(-4)}`,
        phoneNumber
      });
    }

    otpStore.delete(phoneNumber); // Clear used OTP

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login failed' });
      res.json({ message: 'Authentication successful', user });
    });
  });

  app.post("/api/auth/guest", (req, res) => {
    // Create a guest cart
    const guestCart = { items: [], total: 0, count: 0 };
    
    res.status(200).json({
      message: "Guest session created",
      isGuest: true,
      cart: guestCart
    });
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    res.json(req.user);
  });
}