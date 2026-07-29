const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Comment = require("../models/commentModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/add-comment",
  authMiddleware,
  [
    body("task").notEmpty().withMessage("Task ID is required"),
    body("content").trim().notEmpty().withMessage("Comment content is required"),
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

      const newComment = new Comment({
        task: req.body.task,
        user: req.body.userId,
        content: req.body.content,
      });
      await newComment.save();

      const populated = await Comment.findById(newComment._id).populate(
        "user",
        "firstName lastName email"
      );

      res.status(201).send({
        success: true,
        data: populated,
        message: "Comment added successfully",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post("/get-comments", authMiddleware, async (req, res) => {
  try {
    if (!req.body.task) {
      return res.status(400).send({
        success: false,
        message: "Task ID is required",
      });
    }
    const comments = await Comment.find({ task: req.body.task })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;