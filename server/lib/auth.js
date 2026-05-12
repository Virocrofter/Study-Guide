import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

export const authConfig = {
  secret: process.env.AUTH_SECRET, // important in production
  trustHost: true,

  adapter: MongoDBAdapter(clientPromise),
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
  },
};

export default ExpressAuth(authConfig);