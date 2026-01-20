import express from "express";
import {
  createTopic,
  getTopicsByCourse,
  getTopicById,
  updateTopic,
  deleteTopic,
} from "../controllers/topic.controller.js";
import adminMiddleware from "../middlewares/admin.mid.js";

const router = express.Router();

// Create topic (admin only)
router.post("/create", adminMiddleware, createTopic);

// Get topics by course (public)
router.get("/course/:courseId", getTopicsByCourse);

// Get topic by ID (public)
router.get("/:topicId", getTopicById);

// Update topic (admin only)
router.put("/:topicId", adminMiddleware, updateTopic);

// Delete topic (admin only)
router.delete("/:topicId", adminMiddleware, deleteTopic);

export default router;
