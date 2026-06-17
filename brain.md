cd /Users/mosesokpeku/Desktop/Study\ Guide\ Original
cat > brain.md << 'EOF'
# 🧠 Brain.md — StudyGuide Full-Stack Context

> **Purpose**: Single source of truth for AI copilot context.
> **Last Updated**: 2026-06-17
> **Frontend**: React 19 + Vite + Tailwind v4 (complete)
> **Backend**: Node/Express + MongoDB + Auth.js (deployed)

## Tech Stack
- **Frontend**: React ^19.2.0, Vite ^7.3.1, Tailwind ^4.1.18, react-router-dom ^7.13.0, axios ^1.13.6, Quill ^2.0.2, react-youtube ^10.1.0, react-toastify ^11.0.5, uniqid ^5.4.0
- **Backend**: Express ^4.21.0, Mongoose ^8.8.0, MongoDB, @auth/express ^0.12.2, @auth/mongodb-adapter ^3.11.2, Stripe ^16.6.0, Cloudinary ^2.9.0, multer ^1.4.5-lts.1
- **Auth**: Auth.js cookie sessions with Google OAuth, CSRF protection
- **Deploy**: Vercel (frontend + backend)

## Key Architecture Decisions
- Cookie-based auth (no JWT in localStorage)
- All axios calls use `withCredentials: true`
- User._id is String (matches Auth.js adapter)
- Course.educator is String ref
- Purchase.courseId is ObjectId (fixed from String)
- CourseProgress.courseId is ObjectId (fixed from String)
- Quiz schema has `isPublished: Boolean` (default true)

## API Routes
- `/api/auth/*` — Auth.js handled (session, csrf, signin/google, signout)
- `/api/course/*` — Public (all, :id)
- `/api/educator/*` — Educator role required
- `/api/user/*` — Authenticated user

## Missing / TODO
- FlashCards.jsx exists in repo but was not in original paste
- Library module removed from backend due to missing model (can re-add)
- No WebSocket (polling every 5s for chat)

## Env Vars Required
- VITE_BACKEND_URL, VITE_CURRENCY (frontend)
- MONGODB_URI, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CURRENCY, CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET_KEY (backend)
EOF