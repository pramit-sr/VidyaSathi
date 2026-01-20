import mongoose from "mongoose";

const quizScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quizId: {
    type: mongoose.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  topicId: {
    type: mongoose.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  courseId: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  answers: [
    {
      question: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export const QuizScore = mongoose.model("QuizScore", quizScoreSchema);
