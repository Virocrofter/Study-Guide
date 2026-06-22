import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';

// ─── Auth ───
import { authConfig } from './lib/auth.js';
import { ExpressAuth } from '@auth/express';

// ─── Routes ───
import courseRoutes from './routes/courseRoutes.js';
import userRoutes from './routes/userRoutes.js';
import educatorRoutes from './routes/educatorRoutes.js';
import studyGroupRoutes from './routes/studyGroupRoutes.js';
import studySessionRoutes from './routes/studySessionRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ───
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /https:\/\/.*\.vercel\.app$/,  // ← wildcard for all Vercel deployments
  'https://study-guide-frontend-gray.vercel.app',
  'https://study-guide-frontend-traurorous-projects.vercel.app',
  'https://study-guide-frontend.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS BLOCKED] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ─── Custom auth routes (BEFORE ExpressAuth to avoid shadowing) ───
app.use('/api/auth/custom', authRoutes);

// ─── Auth (@auth/express handles OAuth) ───
app.use('/api/auth/*', ExpressAuth(authConfig));

// ─── API Routes ───
app.use('/api/course', courseRoutes);
app.use('/api/user', userRoutes);
app.use('/api/educator', educatorRoutes);
app.use('/api/study-group', studyGroupRoutes);
app.use('/api/study-session', studySessionRoutes);
app.use('/api/achievement', achievementRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/search', searchRoutes);

// ─── Health check ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handler ───
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error('[ERROR]', err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── 404 handler ───
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start server ───
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    // Don't exit immediately — let Vercel retry or show error
    // process.exit(1);
  });

export default app;