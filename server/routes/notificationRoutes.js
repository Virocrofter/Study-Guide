import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protectUser, getNotifications);
router.put("/:id/read", protectUser, markAsRead);
router.put("/read-all", protectUser, markAllAsRead);
export default router;