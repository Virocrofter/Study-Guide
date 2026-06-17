import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) throw new Error('Missing "MONGODB_URI"');
if (!process.env.AUTH_SECRET) throw new Error('Missing "AUTH_SECRET"');
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

const uri = process.env.MONGODB_URI;
const options = { serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true } };

let clientPromise;
if (process.env.NODE_ENV === "development") {
  let g = globalThis;
  if (!g._mongoClientPromise) {
    g._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = g._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

// ─── FRONTEND URL ───
const FRONTEND_URL = process.env.FRONTEND_URL || (
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://study-guide-frontend-gray.vercel.app"
);

export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
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
      // If it's a relative path, send to frontend
      if (url.startsWith("/")) {
        return `${FRONTEND_URL}${url}`;
      }
      try {
        const urlOrigin = new URL(url).origin;
        const allowed = [FRONTEND_URL, "http://localhost:5173", "https://study-guide-frontend-gray.vercel.app"];
        if (allowed.includes(urlOrigin)) return url;
      } catch {
        // invalid url
      }
      // Default: go to frontend dashboard
      return `${FRONTEND_URL}/dashboard`;
    },
  },
};

export default ExpressAuth(authConfig);