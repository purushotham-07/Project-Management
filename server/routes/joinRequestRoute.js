const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const JoinRequest = require("../models/joinRequestModel");
const Project = require("../models/projectModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Request to join a public project
router.post(
  "/request-to-join",
  authMiddleware,
  [
    body("projectId").notEmpty().withMessage("Project ID is required"),
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

      const project = await Project.findById(req.body.projectId);
      if (!project) {
        return res.status(404).send({
          success: false,
          message: "Project not found",
        });
      }

      if (project.visibility !== "Public") {
        return res.status(403).send({
          success: false,
          message: "This project is not accepting join requests",
        });
      }

      // Check if user is already a member
      const isMember =
        project.owner.toString() === req.body.userId ||
        project.members.some((m) => m.user.toString() === req.body.userId);
      if (isMember) {
        return res.status(400).send({
          success: false,
          message: "You are already a member of this project",
        });
      }

      // Check for existing pending request
      const existing = await JoinRequest.findOne({
        project: req.body.projectId,
        user: req.body.userId,
        status: "pending",
      });
      if (existing) {
        return res.status(400).send({
          success: false,
          message: "You already have a pending request for this project",
        });
      }

      const joinRequest = new JoinRequest({
        project: req.body.projectId,
        user: req.body.userId,
        message: req.body.message || "",
      });
      await joinRequest.save();

      const populated = await JoinRequest.findById(joinRequest._id)
        .populate("user", "firstName lastName email");

      res.status(201).send({
        success: true,
        data: populated,
        message: "Join request sent successfully",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// Get join requests for a project (owner/admin only)
router.post("/get-join-requests", authMiddleware, async (req, res) => {
  try {
    if (!req.body.projectId) {
      return res.status(400).send({
        success: false,
        message: "Project ID is required",
      });
    }

    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }

    // Only owner or admin can view requests
    const isOwnerOrAdmin =
      project.owner.toString() === req.body.userId ||
      project.members.some(
        (m) =>
          m.user.toString() === req.body.userId &&
          (m.role === "admin" || m.role === "owner")
      );
    if (!isOwnerOrAdmin) {
      return res.status(403).send({
        success: false,
        message: "Only the project owner or admin can view join requests",
      });
    }

    const requests = await JoinRequest.find({ project: req.body.projectId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      data: requests,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

// Approve or reject a join request
router.post("/respond-to-request", authMiddleware, async (req, res) => {
  try {
    const { requestId, status } = req.body;
    if (!requestId || !["approved", "rejected"].includes(status)) {
      return res.status(400).send({
        success: false,
        message: "Valid request ID and status (approved/rejected) are required",
      });
    }

    const joinRequest = await JoinRequest.findById(requestId).populate("project");
    if (!joinRequest) {
      return res.status(404).send({
        success: false,
        message: "Join request not found",
      });
    }

    const project = joinRequest.project;
    // Verify the responder is owner/admin
    const isOwnerOrAdmin =
      project.owner.toString() === req.body.userId ||
      project.members.some(
        (m) =>
          m.user.toString() === req.body.userId &&
          (m.role === "admin" || m.role === "owner")
      );
    if (!isOwnerOrAdmin) {
      return res.status(403).send({
        success: false,
        message: "Only the project owner or admin can respond to requests",
      });
    }

    joinRequest.status = status;
    joinRequest.respondedBy = req.body.userId;
    joinRequest.respondedAt = new Date();
    await joinRequest.save();

    // If approved, add user as employee member
    if (status === "approved") {
      await Project.findByIdAndUpdate(project._id, {
        $push: {
          members: {
            user: joinRequest.user,
            role: "employee",
          },
        },
      });
    }

    res.status(200).send({
      success: true,
      message: `Join request ${status} successfully`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;