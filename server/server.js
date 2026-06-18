import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

console.log("🔧 Starting server...");
console.log("NODE_ENV:", process.env.NODE_ENV);

import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import { getSession } from "@auth/express";
import authRouter, { authConfig } from "./routes/auth.js";
import courseRouter from "./routes/courseRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

// NEW v2.0 ROUTES
import notificationRouter from "./routes/notificationRoutes.js";
import studyGroupRouter from "./routes/studyGroupRoutes.js";
import achievementRouter from "./routes/achievementRoutes.js";
import studySessionRouter from "./routes/studySessionRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import aiAssistantRouter from "./routes/aiAssistantRoutes.js";

const app = express();

// ─── Connect DB lazily (don't block server startup) ───
let dbConnected = false;
const ensureDB = async () => {
  if (dbConnected && mongoose.connection.readyState === 1) return true;
  try {
    await connectDB();
    dbConnected = true;
    console.log("✅ MongoDB connected");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    return false;
  }
};
// Start connection in background, don't await
ensureDB();

connectCloudinary();
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

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", authRouter);

app.use(async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    res.locals.session = session || null;
    const authFn = () => ({ userId: session?.user?.id });
    authFn.userId = session?.user?.id;
    req.auth = authFn;
  } catch (err) {
    res.locals.session = null;
    const authFn = () => ({ userId: null });
    authFn.userId = null;
    req.auth = authFn;
  }
  next();
});

app.get("/api/health", async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";
  res.json({
    ok: true,
    version: "2.0.0",
    dbStatus,
    dbState,
    features: ["notifications", "study-groups", "achievements", "calendar", "search", "ai-assistant"],
    env: {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
      hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
    },
  });
});

// EXISTING ROUTES
app.use("/api/course", courseRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/user", userRouter);

// NEW v2.0 ROUTES
app.use("/api/notifications", notificationRouter);
app.use("/api/study-groups", studyGroupRouter);
app.use("/api/achievements", achievementRouter);
app.use("/api/study-sessions", studySessionRouter);
app.use("/api/search", searchRouter);
app.use("/api/ai", aiAssistantRouter);

app.get("/", (req, res) => res.send("StudyGuide API v2.0 is active."));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;