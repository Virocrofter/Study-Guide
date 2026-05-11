import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/mongodb.js";
import connectCloudinay from "./configs/cloudinary.js";

import { getSession } from "@auth/express";
import authRouter, { authConfig } from "./routes/auth.js";

import courseRouter from "./routes/courseRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

connectDB();
connectCloudinay();

app.set("trust proxy", true);

app.use(
  cors({
    origin: ["https://studyguidefrontend.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "Stripe-Signature"],
  })
);

/**
 * Stripe MUST receive a raw body for signature verification.
 * This route must be mounted BEFORE express.json().
 */
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());

// Auth.js routes
app.use("/api/auth", authRouter);

// Hydrate session for downstream middleware/controllers
app.use(async (req, res, next) => {
  res.locals.session = await getSession(req, authConfig);
  next();
});

// API routes
app.use("/api/course", courseRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("StudyGuide API is active."));

// For local development; Vercel handles listening in production.
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;