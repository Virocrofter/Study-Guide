import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter, { authConfig } from "./routes/auth.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import achievementRouter from "./routes/achievementRoutes.js";
import studySessionRouter from "./routes/studySessionRoutes.js";
import studyGroupRouter from "./routes/studyGroupRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import aiAssistantRouter from "./routes/aiAssistantRoutes.js";
import { connectDB } from "./configs/mongodb.js";

dotenv.config();

const app = express();

// ─── CORS ───
const allowedOrigins = [
  "http://localhost:5173",
  "https://study-guide-frontend-gray.vercel.app",
  "https://study-guide-frontend-traurorous-projects.vercel.app",
  "https://study-guide-frontend-git-main-traurorous-projects.vercel.app",
  "https://study-guide-frontend.vercel.app",
  "https://study-guide-beta.vercel.app",
  "https://*.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some((o) => o === "*" || o === origin || (o.includes("*") && new RegExp(o.replace("*", ".*")).test(origin)))) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With"],
}));

// ─── BODY PARSERS ───
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK (before DB — lets Vercel verify the function is warm) ───
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ─── DB CONNECTION + ROUTE MOUNTING ───
// Vercel serverless: we MUST await DB connection before mounting auth routes
// because auth.js uses lazy getMongoClient that depends on mongoose being connected.
let dbConnected = false;

const startServer = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log("✅ DB connected — mounting routes");

    // Auth routes MUST be mounted after DB is connected
    app.use("/api/auth", authRouter);

    // All other API routes
    app.use("/api/course", courseRouter);
    app.use("/api/user", userRouter);
    app.use("/api/educator", educatorRouter);
    app.use("/api/search", searchRouter);
    app.use("/api/achievements", achievementRouter);
    app.use("/api/study-sessions", studySessionRouter);
    app.use("/api/study-groups", studyGroupRouter);
    app.use("/api/notifications", notificationRouter);
    app.use("/api/ai-assistant", aiAssistantRouter);

    // Catch-all for API 404s
    app.use("/api/*", (req, res) => {
      res.status(404).json({ success: false, message: "API route not found" });
    });

  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    // Don't crash — let health check still respond, but auth will fail gracefully
  }
};

// Start DB connection immediately
const dbPromise = startServer();

// ─── REQUEST HANDLER WITH DB WAIT ───
// Vercel serverless: wrap requests to ensure DB is connected before handling
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/health")) return next(); // health check bypasses wait
  
  // Wait for DB connection (with timeout)
  if (!dbConnected) {
    const start = Date.now();
    while (!dbConnected && Date.now() - start < 10000) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: "Database not available" });
    }
  }
  next();
});

// ─── VERCEL SERVERLESS EXPORT ───
// Export for Vercel (must be default export)
export default app;

// ─── LOCAL DEV ONLY ───
// Vercel ignores this in production; local dev needs explicit listen
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  // Wait for DB before listening locally too
  dbPromise.then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  });
}