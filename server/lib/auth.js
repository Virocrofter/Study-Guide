import { ExpressAuth } from '@auth/express';
import Google from '@auth/express/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '../configs/mongodb.js';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'database',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://study-guide-frontend-gray.vercel.app',
        'https://study-guide-frontend-traurorous-projects.vercel.app',
        'https://study-guide-frontend.vercel.app',
      ];

      if (url.startsWith('/')) return `${baseUrl}${url}`;

      if (allowedOrigins.some(origin => url.startsWith(origin))) {
        return url;
      }

      return baseUrl;
    },
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
};

export default ExpressAuth(authConfig);