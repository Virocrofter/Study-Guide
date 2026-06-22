import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
if (!process.env.AUTH_SECRET) throw new Error('Missing AUTH_SECRET');
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

// ─── LAZY MONGODB CLIENT ───
// Vercel serverless: mongoose connects AFTER module load, so we can't eagerly create clientPromise.
// MongoDBAdapter accepts a function that returns a Promise<MongoClient> for lazy evaluation.
let cachedClient = null;

const getMongoClient = async () => {
  if (cachedClient) return cachedClient;

  // Wait for mongoose to connect (server.js calls connectDB() before mounting routes)
  const maxWait = 15000;
  const start = Date.now();
  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - start > maxWait) {
      throw new Error("MongoDB connection timeout — cannot initialize Auth.js adapter");
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  // Mongoose 6+ provides getClient() on the connection
  if (!mongoose.connection.getClient) {
    throw new Error("Mongoose connection does not expose getClient()");
  }

  cachedClient = mongoose.connection.getClient();
  return cachedClient;
};

const FRONTEND_URL = process.env.FRONTEND_URL || (
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://study-guide-frontend-traurorous-projects.vercel.app"
);

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const csrfPrefix = useSecureCookies ? "__Host-" : "";

const cookieOptions = {
  httpOnly: true,
  sameSite: useSecureCookies ? "none" : "lax",
  path: "/",
  secure: useSecureCookies,
};

export const authConfig = {
  // Pass the FUNCTION, not the promise — Auth.js calls it lazily per-request
  adapter: MongoDBAdapter(getMongoClient),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
  session: { strategy: "database" },

  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: cookieOptions,
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: { ...cookieOptions, httpOnly: false },
    },
    csrfToken: {
      name: `${csrfPrefix}authjs.csrf-token`,
      options: cookieOptions,
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}authjs.pkce.code_verifier`,
      options: cookieOptions,
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
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
        const allowedOrigins = [
          "https://study-guide-frontend-gray.vercel.app",
          "https://study-guide-frontend-traurorous-projects.vercel.app",
          "https://study-guide-frontend-git-main-traurorous-projects.vercel.app",
          "https://study-guide-frontend.vercel.app",
          "https://study-guide-beta.vercel.app",
          "http://localhost:5173",
          "http://localhost:3000",
        ];
        if (allowedOrigins.includes(urlOrigin)) return url;
        if (/^https:\/\/[^\/]+\.vercel\.app$/.test(urlOrigin)) return url;
      } catch {}
      return FRONTEND_URL;
    },
    async signIn() { return true; },
  },

  debug: process.env.NODE_ENV === "development",
};

export default ExpressAuth(authConfig);