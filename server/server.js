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

// Vercel/proxies
app.set("trust proxy", true);

// IMPORTANT: For credentials (cookies) you must use explicit origins (not "*").
// Also: do NOT include backticks/quotes inside the strings.
const allowedOrigins = new Set([
  "https://study-guide-frontend-gray.vercel.app",
  "http://localhost:5173",
]);

const corsOptions = {
  origin(origin, callback) {
    // allow server-to-server / curl / same-origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) return callback(null, true);

    // optional: allow any other Vercel frontend preview (less secure)
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

// Needed for Auth.js POST actions (like POST /api/auth/signin/google from a form)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// DO NOT override Auth.js' own /api/auth/error route
// app.use("/api/auth/error", (req, res) => { ... });

// Mount Auth.js
app.use("/api/auth", authRouter);

// Hydrate Auth.js session + provide a req.auth() shim
app.use(async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    res.locals.session = session || null;

    const authFn = () => ({ userId: session?.user?.id });
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