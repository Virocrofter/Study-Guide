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
const FRONTEND_URL = process.env.FRONTEND_URL || (
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://study-guide-frontend-gray.vercel.app"
);

// ─── AUTH CONFIG ───
export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
  session: { strategy: "database" },

  // ─── CRITICAL: Cross-origin cookie settings for Vercel ───
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
      // ─── FORCE: Always redirect to frontend /student after ANY auth action ───
      // This prevents old /dashboard links or cached callback URLs from breaking login
      return `${FRONTEND_URL}/student`;
    },
  },

  pages: {
    signIn: `${FRONTEND_URL}/`,
    error: `${FRONTEND_URL}/`,
  },
};

export default ExpressAuth(authConfig);