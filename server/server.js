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

// Stripe webhook controller (keep your existing controller file, but ensure it only exports stripeWebhooks)
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

connectDB();
connectCloudinay();

// Vercel/proxies
app.set("trust proxy", true);

// IMPORTANT: NO backticks/quotes in origins.
// For credentials (cookies) you must use explicit origins (not "*").
const allowedOrigins = new Set([
  "https://study-guide-frontend-gray.vercel.app",
  "http://localhost:5173",
]);

const corsOptions = {
  origin(origin, callback) {
    // allow server-to-server / curl / same-origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    // optional: allow any other Vercel frontend preview
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    return callback(new Error("CORS Not Allowed"));
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

// Preflight (Express 5: use regex, not "*")
app.options(/.*/, cors(corsOptions));

// Stripe webhook MUST be raw body, mounted BEFORE express.json()
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());

// Catch Auth.js error route BEFORE mounting Auth.js
app.use("/api/auth/error", (req, res) => {
  const error = req.query?.error || "Unknown";
  return res.status(400).json({ success: false, error });
});

// Mount Auth.js (Express 5: avoid wildcard paths)
app.use("/api/auth", authRouter);

// Hydrate Auth.js session + provide a Clerk-like req.auth() shim
app.use(async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    res.locals.session = session || null;

    const authFn = () => ({ userId: session?.user?.id });
    // Support old code style: req.auth.userId
    authFn.userId = session?.user?.id;
    req.auth = authFn;
  } catch {
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
