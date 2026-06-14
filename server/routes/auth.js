import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
export const clientPromise = client.connect();

const useSecureCookies = process.env.NODE_ENV === "production";

// In production (frontend domain != backend domain on Vercel),
// cookies must be SameSite=None; Secure so they are sent on cross-site POST.
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
  },
};

// NOTE: basePath is intentionally omitted because server mounts this router at `/api/auth`
export default ExpressAuth(authConfig);
