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

const app = express();

connectDB();

(async () => {
  try {
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) return resolve();
      mongoose.connection.once("connected", resolve);
    });

    const usersCollection = mongoose.connection.collection("users");
    const indexes = await usersCollection.indexes();

    for (const index of indexes) {
      if (index.name !== "_id_" && index.unique) {
        await usersCollection.dropIndex(index.name);
        console.log(`✅ Dropped conflicting unique index: ${index.name}`);
      }
    }
  } catch (e) {
    console.error("Index cleanup error:", e.message);
  }
})();

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

app.use("/api/course", courseRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("StudyGuide API is active."));

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));
}

export default app;