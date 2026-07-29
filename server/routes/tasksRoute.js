const router = require("express").Router();
const { body, validationResult } = require("express-validator");

const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary = require("../config/cloudinaryConfig");
const multer = require("multer");

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

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

router.post(
  "/upload-image",
  authMiddleware,
  multer({ storage: storage }).single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "No file uploaded",
        });
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "tasks",
      });
      const imageURL = result.secure_url;

      await Task.findOneAndUpdate(
        { _id: req.body.taskId },
        {
          $push: {
            attachments: imageURL,
          },
        }
      );

      res.status(200).send({
        success: true,
        message: "Image uploaded successfully",
        data: imageURL,
      });
    } catch (error) {
  console.error("Cloudinary Error:", error);

  res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
}
);

module.exports = router;