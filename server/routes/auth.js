import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import mongoose from "mongoose";

// ─── ENV GUARD ───
if (!process.env.MONGODB_URI) {
  throw new Error('Missing environment variable: "MONGODB_URI"');
}
if (!process.env.AUTH_SECRET) {
  throw new Error('Missing environment variable: "AUTH_SECRET"');
}
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials in environment variables");
}

// ─── SHARED MONGOOSE CONNECTION ───
// Reuse the Mongoose connection instead of creating a separate MongoClient.
// This ensures Auth.js and your API use the SAME connection.
const getMongoClient = async () => {
  if (mongoose.connection.readyState === 1 && mongoose.connection.getClient) {
    return mongoose.connection.getClient();
  }
  
  // Wait for connection (max 10 seconds)
  const maxWait = 10000;
  const start = Date.now();
  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - start > maxWait) {
      throw new Error("MongoDB connection timeout — cannot initialize Auth.js adapter");
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  
  return mongoose.connection.getClient();
};

const clientPromise = getMongoClient().catch((err) => {
  console.error("Failed to get MongoClient for Auth.js adapter:", err.message);
  throw err;
});

// ─── FRONTEND URL CONFIG ───
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

// ─── AUTH CONFIG ───
export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
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
    state: {
      name: `${cookiePrefix}authjs.state`,
      options: cookieOptions,
    },
    nonce: {
      name: `${cookiePrefix}authjs.nonce`,
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
        const baseOrigin = new URL(baseUrl).origin;
        if (urlOrigin === baseOrigin) return url;
        
        const allowedOrigins = [
          "https://study-guide-frontend-gray.vercel.app",
          "https://study-guide-frontend-traurorous-projects.vercel.app",
          "https://study-guide-frontend-git-main-traurorous-projects.vercel.app",
          "https://study-guide-frontend.vercel.app",
          "http://localhost:5173",
          "http://localhost:3000",
        ];

        if (allowedOrigins.includes(urlOrigin)) return url;
        if (/^https:\/\/[^\/]+\.vercel\.app$/.test(urlOrigin)) return url;
      } catch {
        // Invalid URL format
      }

      return FRONTEND_URL;
    },

    async signIn({ user, account, profile }) {
      return true;
    },
  },

  debug: process.env.NODE_ENV === "development",

  logger: {
    error(code, ...message) {
      console.error(`[Auth] ${code}:`, ...message);
    },
    warn(code, ...message) {
      console.warn(`[Auth] ${code}:`, ...message);
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[Auth] ${code}:`, ...message);
      }
    },
  },
};

export default ExpressAuth(authConfig);