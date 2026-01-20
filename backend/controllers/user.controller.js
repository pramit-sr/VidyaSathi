import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";
import { QuizScore } from "../models/quizScore.model.js";
import { Topic } from "../models/topic.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI setup
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const getModel = (modelName) => {
  return genAI.getGenerativeModel({ model: modelName });
};
const modelNames = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-pro-latest"];
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z
      .string()
      .min(3, { message: "firstName must be atleast 3 char long" }),
    lastName: z
      .string()
      .min(3, { message: "lastName must be atleast 3 char long" }),
    email: z.string().email(),
    password: z
      .string()
      .min(6, { message: "password must be atleast 6 char long" }),
  });

  const validatedData = userSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res
      .status(400)
      .json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ errors: "User already exists" });
    }
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "Signup succeedded", newUser });
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    console.log("Error in signup", error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // jwt code
    const token = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_USER_PASSWORD,
      { expiresIn: "1d" }
    );
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, //  can't be accsed via js directly
      secure: process.env.NODE_ENV === "production", // true for https only
      sameSite: "Strict", // CSRF attacks
    };
    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ errors: "Error in login" });
    console.log("error in login", error);
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in logout" });
    console.log("Error in logout", error);
  }
};

export const purchases = async (req, res) => {
  const userId = req.userId;

  try {
    const purchased = await Purchase.find({ userId });

    let purchasedCourseId = [];

    for (let i = 0; i < purchased.length; i++) {
      purchasedCourseId.push(purchased[i].courseId);
    }
    const courseData = await Course.find({
      _id: { $in: purchasedCourseId },
    });

    res.status(200).json({ purchased, courseData });
  } catch (error) {
    res.status(500).json({ errors: "Error in purchases" });
    console.log("Error in purchase", error);
  }
};

/* ============================
   Get Weak Topics (Score < 60%)
============================ */
export const getWeakTopics = async (req, res) => {
  const userId = req.userId;

  try {
    const scores = await QuizScore.find({ userId })
      .populate("topicId", "title")
      .populate("courseId", "title");

    // Calculate average score per topic
    const topicScores = {};
    
    scores.forEach((score) => {
      const topicId = score.topicId._id.toString();
      const topicTitle = score.topicId.title;
      const percentage = (score.score / score.totalQuestions) * 100;

      if (!topicScores[topicId]) {
        topicScores[topicId] = {
          topicId,
          topicTitle,
          scores: [],
          totalScore: 0,
          totalQuestions: 0,
        };
      }

      topicScores[topicId].scores.push(percentage);
      topicScores[topicId].totalScore += score.score;
      topicScores[topicId].totalQuestions += score.totalQuestions;
    });

    // Find weak topics (average < 60%)
    const weakTopics = [];
    Object.values(topicScores).forEach((topic) => {
      const averageScore = topic.scores.reduce((a, b) => a + b, 0) / topic.scores.length;
      if (averageScore < 60) {
        weakTopics.push({
          topicId: topic.topicId,
          topicTitle: topic.topicTitle,
          averageScore: Math.round(averageScore),
        });
      }
    });

    res.status(200).json({ weakTopics });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weak topics" });
    console.log("Error in getWeakTopics", error);
  }
};

/* ============================
   Get Analytics Data (Topic Accuracy)
============================ */
export const getAnalytics = async (req, res) => {
  const userId = req.userId;

  try {
    const scores = await QuizScore.find({ userId })
      .populate("topicId", "title")
      .populate("courseId", "title");

    // Calculate accuracy per topic
    const topicAccuracy = {};
    
    scores.forEach((score) => {
      const topicTitle = score.topicId.title;
      const percentage = (score.score / score.totalQuestions) * 100;

      if (!topicAccuracy[topicTitle]) {
        topicAccuracy[topicTitle] = {
          scores: [],
          totalScore: 0,
          totalQuestions: 0,
        };
      }

      topicAccuracy[topicTitle].scores.push(percentage);
      topicAccuracy[topicTitle].totalScore += score.score;
      topicAccuracy[topicTitle].totalQuestions += score.totalQuestions;
    });

    // Calculate average accuracy per topic
    const analytics = Object.keys(topicAccuracy).map((topic) => {
      const data = topicAccuracy[topic];
      const averageAccuracy = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      return {
        topic,
        accuracy: Math.round(averageAccuracy),
      };
    });

    // Calculate overall stats
    const totalQuizzes = scores.length;
    const weakTopicsCount = analytics.filter((a) => a.accuracy < 60).length;
    const overallAccuracy = analytics.length > 0
      ? Math.round(analytics.reduce((sum, a) => sum + a.accuracy, 0) / analytics.length)
      : 0;

    res.status(200).json({
      analytics,
      stats: {
        totalQuizzes,
        weakTopicsCount,
        overallAccuracy,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
    console.log("Error in getAnalytics", error);
  }
};

/* ============================
   AI Explanation for Weak Topic
============================ */
export const explainTopic = async (req, res) => {
  const { topicId } = req.params;
  const userId = req.userId;

  try {
    const topic = await Topic.findById(topicId).populate("courseId", "title");
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const prompt = `
Explain the following topic in very simple terms.
Use examples and avoid heavy jargon.
Make it easy to understand for someone who is struggling with this concept.

Topic: ${topic.title}
Description: ${topic.description}
Course: ${topic.courseId.title}

Provide:
1. A simple explanation
2. Real-world examples
3. Common mistakes to avoid
4. Key points to remember

Format your response in a clear, friendly way.
`;

    // Try generating with fallback models
    let text;
    let lastError;

    for (const modelName of modelNames) {
      try {
        const currentModel = getModel(modelName);
        const result = await currentModel.generateContent(prompt);
        text = result.response.text();
        break;
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error("All Gemini models failed");
    }

    res.status(200).json({
      topicTitle: topic.title,
      explanation: text,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate explanation", details: error.message });
    console.log("Error in explainTopic", error);
  }
};

/* ============================
   AI Study Recommendations
============================ */
export const getRecommendations = async (req, res) => {
  const userId = req.userId;

  try {
    // Get user's quiz scores
    const scores = await QuizScore.find({ userId })
      .populate("topicId", "title")
      .populate("courseId", "title");

    // Get all topics from purchased courses
    const purchases = await Purchase.find({ userId });
    const purchasedCourseIds = purchases.map((p) => p.courseId);
    const allTopics = await Topic.find({ courseId: { $in: purchasedCourseIds } });

    // Calculate completed, weak, and remaining topics
    const completedTopicIds = new Set(scores.map((s) => s.topicId._id.toString()));
    const topicScores = {};

    scores.forEach((score) => {
      const topicId = score.topicId._id.toString();
      const percentage = (score.score / score.totalQuestions) * 100;

      if (!topicScores[topicId]) {
        topicScores[topicId] = [];
      }
      topicScores[topicId].push(percentage);
    });

    const weakTopics = [];
    const strongTopics = [];

    Object.keys(topicScores).forEach((topicId) => {
      const average = topicScores[topicId].reduce((a, b) => a + b, 0) / topicScores[topicId].length;
      const topic = scores.find((s) => s.topicId._id.toString() === topicId);
      if (average < 60) {
        weakTopics.push(topic.topicId.title);
      } else {
        strongTopics.push(topic.topicId.title);
      }
    });

    const remainingTopics = allTopics
      .filter((t) => !completedTopicIds.has(t._id.toString()))
      .map((t) => t.title);

    const prompt = `
You are a learning advisor.
Based on the following student progress, suggest what they should study next.

Completed Topics (Strong): ${strongTopics.join(", ") || "None"}
Weak Topics (Need Revision): ${weakTopics.join(", ") || "None"}
Remaining Topics: ${remainingTopics.join(", ") || "None"}

Provide:
1. What to study next (prioritize weak topics first)
2. Why this order is recommended
3. Tips for improvement

Keep the response concise and actionable.
`;

    // Try generating with fallback models
    let text;
    let lastError;

    for (const modelName of modelNames) {
      try {
        const currentModel = getModel(modelName);
        const result = await currentModel.generateContent(prompt);
        text = result.response.text();
        break;
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error("All Gemini models failed");
    }

    res.status(200).json({
      recommendations: text,
      weakTopics,
      strongTopics,
      remainingTopics,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate recommendations", details: error.message });
    console.log("Error in getRecommendations", error);
  }
};
