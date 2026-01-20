import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils";

function QuizDisplay({ quiz, topicId, onQuizSubmitted }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [answerDetails, setAnswerDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  const handleAnswerSelect = (questionIndex, answer) => {
    if (submitted) return; // Don't allow changes after submission

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer,
    });
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Please login to submit quiz");
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = quiz.questions.filter(
      (_, index) => !selectedAnswers[index]
    );

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all ${unansweredQuestions.length} remaining questions`);
      return;
    }

    setLoading(true);

    // Format answers for backend
    const answers = Object.keys(selectedAnswers).map((index) => ({
      questionIndex: parseInt(index),
      selectedAnswer: selectedAnswers[index],
    }));

    try {
      const response = await axios.post(
        `${BACKEND_URL}/quiz/submit/${quiz._id}`,
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setScore(response.data.score);
      setAnswerDetails(response.data.answerDetails);
      setSubmitted(true);
      toast.success(
        `Quiz submitted! Score: ${response.data.score}/${response.data.totalQuestions} (${response.data.percentage}%)`
      );

      if (onQuizSubmitted) {
        setTimeout(() => {
          onQuizSubmitted();
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(error?.response?.data?.error || "Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-700">
          Quiz Questions ({quiz.questions.length} questions)
        </h2>
        {submitted && score !== null && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
            Score: {score}/{quiz.questions.length} (
            {Math.round((score / quiz.questions.length) * 100)}%)
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => {
          const isCorrect =
            submitted &&
            answerDetails &&
            answerDetails[questionIndex]?.isCorrect;
          const isIncorrect =
            submitted &&
            answerDetails &&
            !answerDetails[questionIndex]?.isCorrect;
          const selectedAnswer = selectedAnswers[questionIndex];
          const correctAnswer =
            submitted && answerDetails
              ? answerDetails[questionIndex]?.correctAnswer
              : null;

          return (
            <div
              key={questionIndex}
              className={`p-6 border-2 rounded-lg ${
                isCorrect
                  ? "border-green-500 bg-green-50"
                  : isIncorrect
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start mb-4">
                <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold mr-3 flex-shrink-0">
                  {questionIndex + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-800 flex-1">
                  {question.question}
                </h3>
              </div>

              <div className="ml-11 space-y-3">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectOption = submitted && correctAnswer === option;
                  const isWrongSelection =
                    submitted && isSelected && !isCorrectOption;

                  return (
                    <label
                      key={optionIndex}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                        submitted
                          ? isCorrectOption
                            ? "bg-green-200 border-2 border-green-500"
                            : isWrongSelection
                            ? "bg-red-200 border-2 border-red-500"
                            : "bg-gray-100"
                          : isSelected
                          ? "bg-green-100 border-2 border-green-500"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      } ${submitted ? "cursor-default" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerSelect(questionIndex, option)
                        }
                        disabled={submitted}
                        className="mr-3 w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="flex-1 text-gray-700">{option}</span>
                      {submitted && isCorrectOption && (
                        <span className="text-green-600 font-semibold ml-2">
                          ✓ Correct
                        </span>
                      )}
                      {submitted && isWrongSelection && (
                        <span className="text-red-600 font-semibold ml-2">
                          ✗ Your Answer
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {submitted && answerDetails && (
                <div className="mt-4 ml-11 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Your Answer:</span>{" "}
                    {answerDetails[questionIndex]?.selectedAnswer || "Not answered"}
                  </p>
                  {isIncorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      <span className="font-semibold">Correct Answer:</span>{" "}
                      {correctAnswer}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-gray-600">
            Answered: {Object.keys(selectedAnswers).length} /{" "}
            {quiz.questions.length}
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(selectedAnswers).length === 0}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 transition duration-300 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}

      {submitted && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Quiz Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-800">
                {quiz.questions.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-600">Your Score</p>
              <p className="text-2xl font-bold text-green-600">
                {score}/{quiz.questions.length}
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white p-4 rounded-lg">
            <p className="text-gray-600">Percentage</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((score / quiz.questions.length) * 100)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizDisplay;
