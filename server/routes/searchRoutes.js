import express from "express";
import { globalSearch, reindexAll } from "../controllers/searchController.js";
import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protectUser, globalSearch);
router.post("/reindex", protectUser, reindexAll);
export default router;