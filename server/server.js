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

// Establish Database connection
connectDB().catch((err) => console.error("DB connection failed:", err.message));

/**
 * Dynamic CORS Configuration
 * - reflect allowed origins back (required for cookies/credentials)
 * - normalize trailing slash because browsers can send origin with/without it in some cases
 */
const allowedOrigins = [
  "https://study-guide-frontend-gray.vercel.app",
  "https://study-guide-frontend-traurorous-projects.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".vercel.app") ||
      normalizedOrigin.startsWith("http://localhost:")
    ) {
      return callback(null, normalizedOrigin);
    }

    // Instead of throwing, disable CORS for this origin gracefully
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "X-CSRF-Token"
  ],
};

app.use(cors(corsOptions));

// Ensure Auth routes also get CORS headers for preflight
app.options("/api/auth/*", cors(corsOptions));

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

// Global error handler — ensures CORS headers are sent even on 500s
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;