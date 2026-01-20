import express from "express";
import {
  generateQuiz,
  getQuizByTopic,
  submitQuiz,
  getUserQuizScores,
} from "../controllers/quiz.controller.js";
import userMiddleware from "../middlewares/user.mid.js";

const router = express.Router();

// Generate quiz for a topic (requires authentication)
router.post("/generate/:topicId", userMiddleware, generateQuiz);

// Get quiz by topic ID (requires authentication)
router.get("/topic/:topicId", userMiddleware, getQuizByTopic);

// Submit quiz answers (requires authentication)
router.post("/submit/:quizId", userMiddleware, submitQuiz);

// Get user's quiz scores (requires authentication)
router.get("/scores", userMiddleware, getUserQuizScores);

export default router;
