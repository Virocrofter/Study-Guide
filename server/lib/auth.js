import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient, ServerApiVersion } from "mongodb";

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

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = globalThis;
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

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
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  trustHost: true,
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
        // Invalid URL format, fall through to default
      }

      return baseUrl;
    },
  },
};

export default ExpressAuth(authConfig);