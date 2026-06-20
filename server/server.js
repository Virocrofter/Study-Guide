import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { authConfig } from "./lib/auth.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import educatorRouter from "./routes/educator.js";
import courseRouter from "./routes/course.js";
import quizRouter from "./routes/courseRoutes.js"; // Handles /api/quiz internally
import notificationRouter from "./routes/notificationRoutes.js";
import achievementRouter from "./routes/achievementRoutes.js";
import studyGroupRouter from "./routes/studyGroupRoutes.js";
import studySessionRouter from "./routes/studySessionRoutes.js";
import searchRouter from "./routes/searchRoutes.js";
import aiAssistantRouter from "./routes/aiAssistantRoutes.js";

const app = express();

// Establish Database connection
connectDB();

// Dynamic CORS Configuration
const allowedOrigins = [
  "https://study-guide-frontend-gray.vercel.app",
  "https://study-guide-frontend-traurorous-projects.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      
      // Allow if origin matches explicit list, localhost, or any Vercel deployment preview url
      if (
        allowedOrigins.includes(origin) || 
        origin.endsWith(".vercel.app") || 
        origin.startsWith("http://localhost:")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "X-CSRF-Token"
    ]
  })
);

// Global Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Auth.js integration endpoint configuration
app.use("/api/auth", authRouter);

// REST Platform Application Endpoints
app.use("/api/user", userRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/achievements", achievementRouter);
app.use("/api/study-groups", studyGroupRouter);
app.use("/api/study-sessions", studySessionRouter);
app.use("/api/search", searchRouter);
app.use("/api/ai", aiAssistantRouter);

app.get("/", (req, res) => res.send("StudyGuide API v2.0 is active."));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;