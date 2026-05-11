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

// Required on Vercel / proxies for correct host/proto
app.set("trust proxy", true);

// IMPORTANT: do NOT include backticks/quotes in origins
app.use(
  cors({
    // Wrap origins in quotes and place them in an array
    origin: [
      "https://study-guide-frontend-gray.vercel.app", 
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "Stripe-Signature",
      "stripe-signature",
    ],
  })
);


// Stripe webhook MUST be raw body, mounted BEFORE express.json()
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

app.use(express.json());

// Catch Auth.js error route BEFORE mounting Auth.js
app.use("/api/auth/error", (req, res) => {
  const error = req.query?.error || "Unknown";
  return res.status(400).json({ success: false, error });
});

// Mount Auth.js EXACTLY like docs recommend (wildcard)
app.use("/api/auth/*", authRouter);

// Hydrate session for downstream middleware/controllers
app.use(async (req, res, next) => {
  try {
    res.locals.session = await getSession(req, authConfig);
  } catch {
    res.locals.session = null;
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
