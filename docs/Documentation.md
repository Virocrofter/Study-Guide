StudyGuide API Documentation v2.0
Base URL
plain
Production: https://your-api.com/api
Development: http://localhost:8080/api
Authentication
All endpoints (except /auth/*) require a Bearer token in the Authorization header:
plain
Authorization: Bearer <token>

🔔 Notifications
GET /api/notifications
Get all notifications for the current user.

Response:
JSON
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5
}

PUT /api/notifications/:id/read
Mark a single notification as read.
PUT /api/notifications/read-all
Mark all notifications as read.

👥 Study Groups
GET /api/study-groups
List all groups the user can access (member, creator, or public).
POST /api/study-groups
Create a new study group.

Body:
JSON
{
  "name": "Calculus Study Group",
  "description": "Prep for finals",
  "courseId": "...",
  "isPublic": true
}

POST /api/study-groups/:id/join
Join a study group.
POST /api/study-groups/:id/leave
Leave a study group.
GET /api/study-groups/:id/messages
Get chat messages for a group.
POST /api/study-groups/:id/messages
Post a message to the group.

Body:
JSON
{ "text": "Hello everyone!" }
GET /api/study-groups/leaderboard/global
Get global study group leaderboard.

🏆 Achievements
GET /api/achievements
Get current user's achievements and total points.

Response:
JSON
{
  "success": true,
  "achievements": [...],
  "totalPoints": 1250
}

GET /api/achievements/leaderboard
Get global leaderboard by points.

Response:
JSON
{
  "success": true,
  "leaderboard": [
    { "_id": "user-id", "totalPoints": 2000, "badges": 8 },
    ...
  ]
}

📅 Study Sessions
GET /api/study-sessions?start=...&end=...
Get study sessions for a date range.
POST /api/study-sessions
Create a new study session.

Body:
JSON
{
  "title": "Math Review",
  "description": "Chapter 5-7",
  "startTime": "2026-06-20T10:00:00Z",
  "endTime": "2026-06-20T12:00:00Z",
  "courseId": "...",
  "type": "review"
}

PUT /api/study-sessions/:id
Update a session (mark complete, edit details).
DELETE /api/study-sessions/:id
Delete a session.
GET /api/study-sessions/stats
Get weekly and total study stats.

🔍 Search
GET /api/search?q=query&type=optional
Global full-text search across all content types.
Query Params:
q (required): Search query (min 2 chars)
type (optional): Filter by course, flashcard, studyguide, material, quiz

Response:
JSON
{
  "success": true,
  "results": [
    {
      "entityType": "course",
      "entityId": "...",
      "title": "Advanced Calculus",
      "description": "...",
      "score": 5.2
    }
  ]
}

POST /api/search/reindex
Rebuild the search index from all existing data. (Admin/one-time use)
🤖 AI Assistant
POST /api/ai/flashcards
Generate flashcards from text.

Body:
JSON
{
  "text": "Your lecture notes here...",
  "count": 5
}

POST /api/ai/study-guide
Generate a structured study guide.
Body:

JSON
{
  "title": "Optional title",
  "text": "Your notes here..."
}

POST /api/ai/practice-test
Generate a practice test with MCQs.

Body:
JSON
{
  "title": "Optional title",
  "text": "Your notes here...",
  "questionCount": 5
}

📚 Existing Endpoints (Unchanged)
Auth
GET /api/auth/session
GET /api/auth/signin
GET /api/auth/signout
Courses
GET /api/course/all
GET /api/course/:id
POST /api/course/rating
Educator
GET /api/educator/update-role
POST /api/educator/add-course
GET /api/educator/courses
GET /api/educator/dashboard
GET /api/educator/enrolled-students
GET /api/educator/messages/:courseId
POST /api/educator/messages/:courseId
GET /api/educator/materials/:courseId
POST /api/educator/materials/:courseId
DELETE /api/educator/materials/:materialId
GET /api/educator/quizzes/:courseId
POST /api/educator/quizzes/:courseId
DELETE /api/educator/quizzes/:quizId
User
GET /api/user/data
GET /api/user/enrolled-courses
POST /api/user/purchase
POST /api/user/update-course-progress
POST /api/user/get-course-progress
POST /api/user/add-rating
POST /api/user/become-educator
GET /api/user/messages/:courseId
POST /api/user/messages/:courseId
GET /api/user/materials/:courseId
GET /api/user/quizzes/:courseId
POST /api/user/quizzes/:quizId/submit
GET /api/user/quiz-submissions
GET /api/user/flashcards
POST /api/user/flashcards
PUT /api/user/flashcards/:id
DELETE /api/user/flashcards/:id
POST /api/user/flashcards/:id/review
GET /api/user/folders
POST /api/user/folders
DELETE /api/user/folders/:id
GET /api/user/study-guides
POST /api/user/study-guides
PUT /api/user/study-guides/:id
DELETE /api/user/study-guides/:id
GET /api/user/practice-tests
POST /api/user/practice-tests
DELETE /api/user/practice-tests/:id
POST /api/user/practice-tests/:id/attempt
Webhooks
POST /api/webhooks/stripe
Stripe webhook for payment events. Requires raw body parsing.
Health Check
GET /api/health
Response:
JSON
{
  "ok": true,
  "version": "2.0.0",
  "features": ["notifications", "study-groups", "achievements", "calendar", "search", "ai-assistant"],
  "env": {
    "hasAuthSecret": true,
    "hasMongoUri": true,
    "hasGoogleId": true,
    "hasGoogleSecret": true,
    "nodeEnv": "production"
  }
}
Error Responses
All errors follow this format:
JSON
{
  "success": false,
  "message": "Error description"
}
Common status codes:
400 - Bad Request
401 - Unauthorized
404 - Not Found
500 - Server Error
Rate Limits
Recommended rate limits for production:
Search: 30 requests/minute
AI Generation: 10 requests/minute
Notifications: 60 requests/minute
Study Groups: 30 requests/minute
Documentation version: 2.0.0 | Last updated: June 2026