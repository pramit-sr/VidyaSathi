import express from "express";
import {
  login,
  logout,
  purchases,
  signup,
  getWeakTopics,
  getAnalytics,
  explainTopic,
  getRecommendations,
} from "../controllers/user.controller.js";
import userMiddleware from "../middlewares/user.mid.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/purchases", userMiddleware, purchases);

// Analytics endpoints
router.get("/weak-topics", userMiddleware, getWeakTopics);
router.get("/analytics", userMiddleware, getAnalytics);
router.post("/explain-topic/:topicId", userMiddleware, explainTopic);
router.get("/recommendations", userMiddleware, getRecommendations);

export default router;
