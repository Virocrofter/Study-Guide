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
      return `${FRONTEND_URL}/student`;
    },
  },

  pages: {
    signIn: `${FRONTEND_URL}/`,
    error: `${FRONTEND_URL}/`,
  },
};

export default ExpressAuth(authConfig);