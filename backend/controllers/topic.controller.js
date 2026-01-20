import { Topic } from "../models/topic.model.js";
import { Course } from "../models/course.model.js";
import mongoose from "mongoose";

// Create a topic for a course
export const createTopic = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, courseId } = req.body;

  console.log("Create topic request:", { adminId, title, description, courseId });

  try {
    if (!title || !description || !courseId) {
      console.log("Validation failed: Missing fields");
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!adminId) {
      console.log("No adminId found in request");
      return res.status(401).json({ error: "Admin authentication required" });
    }

    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log("Invalid courseId format:", courseId);
      return res.status(400).json({ error: "Invalid course ID format" });
    }

    // Verify course exists (any admin can add topics)
    const course = await Course.findById(courseId);
    if (!course) {
      console.log("Course not found:", courseId);
      return res.status(404).json({ error: "Course not found" });
    }

    console.log("Course found, creating topic...");
    const topic = await Topic.create({
      title,
      description,
      courseId,
    });

    console.log("Topic created successfully:", topic._id);
    res.status(201).json({
      message: "Topic created successfully",
      topic,
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({
      error: "Error creating topic",
      details: error.message,
    });
  }
};

// Get all topics for a course
export const getTopicsByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const topics = await Topic.find({ courseId }).sort({ createdAt: -1 });
    res.status(200).json({ topics });
  } catch (error) {
    console.error("Error getting topics:", error);
    res.status(500).json({ error: "Error getting topics" });
  }
};

// Get topic by ID
export const getTopicById = async (req, res) => {
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId).populate("courseId", "title");
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.status(200).json({ topic });
  } catch (error) {
    console.error("Error getting topic:", error);
    res.status(500).json({ error: "Error getting topic" });
  }
};

// Update topic
export const updateTopic = async (req, res) => {
  const adminId = req.adminId;
  const { topicId } = req.params;
  const { title, description } = req.body;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Verify course belongs to admin
    const course = await Course.findOne({
      _id: topic.courseId,
      creatorId: adminId,
    });

    if (!course) {
      return res.status(403).json({
        error: "You don't have permission to update this topic",
      });
    }

    const updatedTopic = await Topic.findByIdAndUpdate(
      topicId,
      { title, description },
      { new: true }
    );

    res.status(200).json({
      message: "Topic updated successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ error: "Error updating topic" });
  }
};

// Delete topic
export const deleteTopic = async (req, res) => {
  const adminId = req.adminId;
  const { topicId } = req.params;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Verify course belongs to admin
    const course = await Course.findOne({
      _id: topic.courseId,
      creatorId: adminId,
    });

    if (!course) {
      return res.status(403).json({
        error: "You don't have permission to delete this topic",
      });
    }

    await Topic.findByIdAndDelete(topicId);

    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ error: "Error deleting topic" });
  }
};
