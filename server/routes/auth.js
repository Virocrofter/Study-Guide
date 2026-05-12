import { ExpressAuth } from "@auth/express";
import Google from "@auth/express/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  session: { strategy: "database" },

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