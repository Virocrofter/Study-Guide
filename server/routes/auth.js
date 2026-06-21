import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ServerApiVersion } from "mongodb";

// ─── ENV GUARD ───
if (!process.env.MONGODB_URI) {
  console.error('Missing environment variable: "MONGODB_URI"');
}
if (!process.env.AUTH_SECRET) {
  console.error('Missing environment variable: "AUTH_SECRET"');
}
if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  console.error("Missing Google OAuth credentials");
}

const uri = process.env.MONGODB_URI || "";
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
      return null;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    return null;
  });
}

// ─── FRONTEND URL CONFIG ───
// Set FRONTEND_URL env var to your deployed frontend URL
if (!process.env.FRONTEND_URL) {
  console.warn("FRONTEND_URL not set. Using default fallback. Set this env var to your deployed frontend URL.");
}
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
  // Trust proxy is set in server.js, so we can use the standard cookie options
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
        // Fetch role from the user object stored in database
        session.user.role = user.role || "student";
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Default: allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      try {
        const urlOrigin = new URL(url).origin;
        const baseOrigin = new URL(baseUrl).origin;
        // Same-origin redirect
        if (urlOrigin === baseOrigin) return url;
        
        // Allowed frontend origins
        const allowedOrigins = [
          "https://study-guide-frontend-gray.vercel.app",
          "https://study-guide-frontend-traurorous-projects.vercel.app",
          "https://study-guide-frontend-git-main-traurorous-projects.vercel.app",
          "https://study-guide-frontend.vercel.app",
          "http://localhost:5173",
          "http://localhost:3000",
        ];

        if (allowedOrigins.includes(urlOrigin)) return url;

        // Allow any Vercel preview deployment
        if (/^https:\/\/[^\/]+\.vercel\.app$/.test(urlOrigin)) return url;
      } catch {
        // Invalid URL format, fall through to default
      }

      // Fallback to frontend URL
      return FRONTEND_URL;
    },

    async signIn({ user, account, profile }) {
      // Allow all sign-ins (Google handles verification)
      return true;
    },
  },

  // Use relative paths for pages - Auth.js handles baseUrl automatically
  // Only override if you need custom pages
  // pages: {
  //   signIn: "/",
  //   error: "/",
  // },

  // Debug mode for development
  debug: process.env.NODE_ENV === "development",

  // Custom logger to suppress verbose logs in production
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