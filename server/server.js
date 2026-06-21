import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";
import notificationRouter from "./routes/notificationRoutes.js";
import achievementRouter from "./routes/achievementRoutes.js";
import studyGroupRouter from "./routes/studyGroupRoutes.js";
import studySessionRouter from "./routes/studySessionRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import aiAssistantRouter from "./routes/aiAssistantRoutes.js";

const app = express();

// Trust proxy (required for secure cookies behind Vercel's reverse proxy)
app.set("trust proxy", true);

// Establish Database connection
connectDB().catch((err) => console.error("DB connection failed:", err.message));

/**
 * Dynamic CORS Configuration
 * - reflect allowed origins back (required for cookies/credentials)
 * - normalize trailing slash because browsers can send origin with/without it in some cases
 * - added wildcard support for all vercel.app preview deployments
 */
const allowedOrigins = [
  "https://study-guide-frontend-gray.vercel.app",
  "https://study-guide-frontend-traurorous-projects.vercel.app",
  "https://study-guide-frontend-git-main-traurorous-projects.vercel.app",
  "https://study-guide-frontend.vercel.app",
  // Allow any Vercel preview deployment of the frontend
  "https://study-guide-frontend",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    // Check exact matches
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, normalizedOrigin);
    }

    // Check localhost development origins
    if (
      normalizedOrigin.startsWith("http://localhost:") ||
      normalizedOrigin.startsWith("http://127.0.0.1:")
    ) {
      return callback(null, normalizedOrigin);
    }

    // Allow any *.vercel.app preview deployment
    if (/^https:\/\/[^\/]+\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, normalizedOrigin);
    }

    // Check if it's a known frontend pattern (any subdomain of the frontend)
    if (
      normalizedOrigin.includes("study-guide-frontend") &&
      normalizedOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, normalizedOrigin);
    }

    // Reject unknown origins
    console.warn(`CORS blocked origin: ${normalizedOrigin}`);
    return callback(new Error(`Origin ${normalizedOrigin} not allowed by CORS`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "X-CSRF-Token",
    "Origin",
    "Cookie",
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours - cache preflight response
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS globally BEFORE all routes
app.use(cors(corsOptions));

// Handle ALL preflight requests globally - must be before route handlers
app.options("*", cors(corsOptions));

// Stripe webhook must receive raw body BEFORE express.json()
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Global Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Auth.js integration endpoint configuration
app.use("/api/auth", authRouter);

// REST Platform Application Endpoints
app.use("/api/user", userRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/achievements", achievementRouter);
app.use("/api/study-groups", studyGroupRouter);
app.use("/api/study-sessions", studySessionRouter);
app.use("/api/search", searchRouter);
app.use("/api/ai", aiAssistantRouter);

app.get("/", (req, res) => res.send("StudyGuide API v2.0 is active."));

// Health check endpoint for debugging CORS
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || "no-origin",
    env: process.env.NODE_ENV || "unknown",
  });
});

// Global error handler - ensures CORS headers are sent even on 500s
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;