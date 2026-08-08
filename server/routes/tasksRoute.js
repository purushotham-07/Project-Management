const router = require("express").Router();
const { body, validationResult } = require("express-validator");

const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");
const { sendEmail } = require("../config/emailConfig");

router.post(
  "/create-task",
  authMiddleware,
  [
    body("name").trim().notEmpty().withMessage("Task name is required"),
    body("description").trim().notEmpty().withMessage("Task description is required"),
    body("project").notEmpty().withMessage("Project is required"),
    body("assignedTo").notEmpty().withMessage("Assigned user is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({
          success: false,
          message: errors.array()[0].msg,
        });
      }

      const newTask = new Task(req.body);
      await newTask.save();

      // Send email notification to assigned user
      const assignedUser = await User.findById(req.body.assignedTo);
      const project = await Project.findById(req.body.project);
      if (assignedUser && project) {
        await sendEmail({
          to: assignedUser.email,
          subject: `New Task Assigned: ${req.body.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #333; margin-bottom: 20px;">New Task Assigned 📋</h2>
              <p style="color: #555; font-size: 14px;">You have been assigned a new task in project <strong>${project.name}</strong>.</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Task:</strong> ${req.body.name}</p>
                <p><strong>Description:</strong> ${req.body.description}</p>
                <p><strong>Priority:</strong> ${req.body.priority || "Medium"}</p>
                ${req.body.dueDate ? `<p><strong>Due Date:</strong> ${new Date(req.body.dueDate).toLocaleDateString()}</p>` : ""}
              </div>
              <p style="color: #777; font-size: 13px;">Please log in to your project management dashboard to view the task details.</p>
            </div>
          `,
        });
      }

      res.status(201).send({
        success: true,
        message: "Task created successfully",
        data: newTask,
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post("/get-all-tasks", authMiddleware, async (req, res) => {
  try {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === "all") {
        delete req.body[key];
      }
    });
    delete req.body["userId"];
    const tasks = await Task.find(req.body)
      .populate("assignedTo")
      .populate("assignedBy")
      .populate("project")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/update-task", authMiddleware, async (req, res) => {
  try {
    if (!req.body._id) {
      return res.status(400).send({
        success: false,
        message: "Task ID is required",
      });
    }
    const task = await Task.findById(req.body._id);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Task not found",
      });
    }
    await Task.findByIdAndUpdate(req.body._id, req.body);
    res.status(200).send({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

router.post("/delete-task", authMiddleware, async (req, res) => {
  try {
    if (!req.body._id) {
      return res.status(400).send({
        success: false,
        message: "Task ID is required",
      });
    }
    const task = await Task.findById(req.body._id);
    if (!task) {
      return res.status(404).send({
        success: false,
        message: "Task not found",
      });
    }
    await Task.findByIdAndDelete(req.body._id);
    res.status(200).send({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Use memory storage for Render deployment (ephemeral filesystem)
const storage = multer.memoryStorage();

router.post(
  "/upload-image",
  authMiddleware,
  multer({ storage }).single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "No file uploaded",
        });
      }

      // Upload buffer directly to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "project-management",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      return res.status(200).send({
        success: true,
        message: "Image uploaded successfully",
        data: result.secure_url,
      });
    } catch (error) {
      console.error("Cloudinary Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;