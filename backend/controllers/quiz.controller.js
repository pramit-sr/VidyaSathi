import { Quiz } from "../models/quiz.model.js";
import { QuizScore } from "../models/quizScore.model.js";
import { Topic } from "../models/topic.model.js";
import { Course } from "../models/course.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config.js";

/* ============================
   Gemini Initialization
============================ */
console.log("🔥 QUIZ CONTROLLER LOADED – GEMINI MODELS READY");

if (!config.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not configured");
}

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// ✅ Try multiple models with fallback
const getModel = (modelName) => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Model priority: gemini-2.5-flash > gemini-2.5-pro > gemini-2.0-flash > gemini-pro-latest
const modelNames = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-pro-latest"];

/* ============================
   Generate Quiz
============================ */

export const generateQuiz = async (req, res) => {
  console.log("🔥 GENERATE QUIZ CALLED");
  const { topicId } = req.params;
  const { numQuestions = 5 } = req.body;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    const course = await Course.findById(topic.courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Avoid regenerating quiz
    const existingQuiz = await Quiz.findOne({ topicId });
    if (existingQuiz) {
      return res.status(200).json({
        message: "Quiz already exists for this topic",
        quiz: existingQuiz,
      });
    }

    /* ===== Gemini Prompt ===== */
    const prompt = `
Generate ${numQuestions} MCQs from the topic below.

Rules:
- Each question must have:
  - question (string)
  - options (array of exactly 4 strings)
  - correctAnswer (string, must match one option)
- Return ONLY valid JSON
- No markdown
- No explanation

Topic Title: ${topic.title}
Topic Description: ${topic.description}
Course: ${course.title}

JSON format:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": ""
    }
  ]
}
`;

    // Try generating with fallback models
    let result;
    let text;
    let lastError;
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        const currentModel = getModel(modelName);
        result = await currentModel.generateContent(prompt);
        text = result.response.text();
        console.log(`✅ Successfully used model: ${modelName}`);
        break; // Success, exit loop
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
        lastError = error;
        continue; // Try next model
      }
    }
    
    if (!text) {
      throw lastError || new Error("All Gemini models failed");
    }

    /* ===== Safe JSON Extraction ===== */
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid AI response format");
    }

    const quizData = JSON.parse(text.slice(start, end + 1));

    if (!Array.isArray(quizData.questions)) {
      throw new Error("AI response missing questions array");
    }

    const quiz = await Quiz.create({
      topicId: topic._id,
      courseId: course._id,
      questions: quizData.questions,
    });

    return res.status(201).json({
      message: "Quiz generated successfully",
      quiz,
    });
  } catch (error) {
    console.error("Quiz generation failed:", error.message);
    return res.status(500).json({
      error: "Failed to generate quiz",
      details: error.message,
    });
  }
};

/* ============================
   Get Quiz (Without Answers)
============================ */

export const getQuizByTopic = async (req, res) => {
  const { topicId } = req.params;

  try {
    const quiz = await Quiz.findOne({ topicId }).populate("topicId", "title");
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const sanitizedQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
      })),
    };

    res.status(200).json({ quiz: sanitizedQuiz });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};

/* ============================
   Submit Quiz
============================ */

export const submitQuiz = async (req, res) => {
  const userId = req.userId;
  const { quizId } = req.params;
  const { answers } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    let score = 0;

    const answerDetails = quiz.questions.map((q, index) => {
      const userAnswer = answers.find(a => a.questionIndex === index);
      const selectedAnswer = userAnswer?.selectedAnswer || "";
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (isCorrect) score++;

      return {
        question: q.question,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const quizScore = await QuizScore.create({
      userId,
      quizId,
      topicId: quiz.topicId,
      courseId: quiz.courseId,
      score,
      totalQuestions: quiz.questions.length,
      answers: answerDetails,
    });

    res.status(200).json({
      message: "Quiz submitted",
      score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      quizScore,
    });
  } catch (error) {
    res.status(500).json({ error: "Quiz submission failed" });
  }
};

/* ============================
   Get User Quiz Scores
============================ */

export const getUserQuizScores = async (req, res) => {
  const userId = req.userId;

  try {
    const scores = await QuizScore.find({ userId })
      .populate("quizId", "questions")
      .populate("topicId", "title")
      .populate("courseId", "title")
      .sort({ submittedAt: -1 });

    res.status(200).json({ scores });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quiz scores" });
  }
};
