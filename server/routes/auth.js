import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ServerApiVersion } from "mongodb";

// ─── ENV GUARD ───
if (!process.env.MONGODB_URI) {
  throw new Error('Missing environment variable: "MONGODB_URI"');
}
if (!process.env.AUTH_SECRET) {
  throw new Error('Missing environment variable: "AUTH_SECRET"');
}
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// ─── CACHED CLIENT (required for Vercel serverless) ───
let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = globalThis;
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      throw err;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  });
}

// ─── AUTH CONFIG ───
export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",     // ← explicit basePath
  session: { strategy: "database" },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || "student";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const urlOrigin = new URL(url).origin;
        const baseOrigin = new URL(baseUrl).origin;
        if (urlOrigin === baseOrigin) return url;
        const allowedOrigins = [
          "https://study-guide-frontend-gray.vercel.app",
          "http://localhost:5173",
        ];
        if (allowedOrigins.includes(urlOrigin)) return url;
      } catch {
        // invalid url
      }
      return baseUrl;
    },
  },
};

export default ExpressAuth(authConfig);