import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import studyGroupRouter from "./routes/studyGroupRoutes.js";
import studySessionRouter from "./routes/studySessionRoutes.js";
import achievementRouter from "./routes/achievementRoutes.js";
import aiAssistantRouter from "./routes/aiAssistantRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();
app.set("trust proxy", true);

const allowedOrigins = [
  "http://localhost:5173",
  "https://study-guide-frontend-gray.vercel.app",
  "https://study-guide-frontend-traurorous-projects.vercel.app",
  /\.vercel\.app$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))) {
      callback(null, true);
    } else {
      console.warn("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── CRITICAL FIX: await DB connection BEFORE mounting auth routes ───
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected — mounting routes");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }

  // Mount auth routes ONLY after DB is ready
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/course", courseRouter);
  app.use("/api/educator", educatorRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/study-groups", studyGroupRouter);
  app.use("/api/study-sessions", studySessionRouter);
  app.use("/api/achievements", achievementRouter);
  app.use("/api/ai-assistant", aiAssistantRouter);
  app.use("/api/search", searchRouter);

  app.get("/", (req, res) => {
    res.send("StudyGuide API v2.0 is active.");
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      dbConnected: !!global.mongoose?.conn,
      timestamp: new Date().toISOString(),
    });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  });
};

startServer();

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

export default app;