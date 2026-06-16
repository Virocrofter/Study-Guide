import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

// ─── EARLY ENV CHECK ───
console.log("🔧 Starting server...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("AUTH_SECRET set?", !!process.env.AUTH_SECRET);
console.log("MONGODB_URI set?", !!process.env.MONGODB_URI);

import connectDB from "./configs/mongodb.js";
import connectCloudinay from "./configs/cloudinary.js";

import { getSession } from "@auth/express";
import authRouter, { authConfig } from "./routes/auth.js";

import courseRouter from "./routes/courseRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import userRouter from "./routes/userRoutes.js";

import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

// ─── CONNECT DB & CLEANUP OLD INDEX ───
connectDB();

(async () => {
  try {
    const conn = mongoose.connection;
    if (conn.readyState === 1) {
      await conn.collection("users").dropIndex("username_1");
      console.log("✅ Dropped old username_1 index");
    }
  } catch (e) {
    // Index might not exist — this is fine
  }
})();

connectCloudinay();

app.set("trust proxy", true);

const allowedOrigins = new Set([
  "https://study-guide-frontend-gray.vercel.app",
  "http://localhost:5173",
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    return callback(new Error(`CORS Not Allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "Stripe-Signature",
    "stripe-signature",
  ],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Stripe webhook MUST be raw body, mounted BEFORE body parsers
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount Auth.js
app.use("/api/auth", authRouter);

// Hydrate Auth.js session
app.use(async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    res.locals.session = session || null;

    const authFn = () => ({ userId: session?.user?.id });
    authFn.userId = session?.user?.id;
    req.auth = authFn;
  } catch (err) {
    console.error("Session hydration error:", err.message);
    res.locals.session = null;
    const authFn = () => ({ userId: null });
    authFn.userId = null;
    req.auth = authFn;
  }
  next();
});

app.use("/api/course", courseRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("StudyGuide API is active."));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;