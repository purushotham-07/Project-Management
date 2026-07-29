const router = require("express").Router();
const Project = require("../models/projectModel");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/userModel");

router.post("/create-project", authMiddleware, async (req, res) => {
  try {
    req.body.owner = req.body.userId;
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).send({
      success: true,
      data: newProject,
      message: "Project created successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/get-all-projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.body.userId,
    }).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/get-project-by-id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.body._id)
      .populate("owner")
      .populate("members.user");
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }
    res.status(200).send({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/get-projects-by-role", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userId;
    const projects = await Project.find({ "members.user": userId })
      .sort({
        createdAt: -1,
      })
      .populate("owner");
    res.status(200).send({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/edit-project", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.body._id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }
    // Only owner or admin can edit
    const currentUserMember = project.members.find(
      (member) => member.user.toString() === req.body.userId
    );
    const isOwnerOrAdmin =
      project.owner.toString() === req.body.userId ||
      (currentUserMember && (currentUserMember.role === "admin" || currentUserMember.role === "owner"));
    if (!isOwnerOrAdmin) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to edit this project",
      });
    }
    await Project.findByIdAndUpdate(req.body._id, req.body);
    res.status(200).send({
      success: true,
      message: "Project updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/delete-project", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.body._id);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }
    // Only owner can delete
    if (project.owner.toString() !== req.body.userId) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to delete this project",
      });
    }
    await Project.findByIdAndDelete(req.body._id);
    res.status(200).send({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// Public discovery: get all public projects with search/filter and pagination
router.post("/get-public-projects", authMiddleware, async (req, res) => {
  try {
    const { search, tags, techStack, projectStatus, page = 1, limit = 12 } = req.body;
    const query = { visibility: "Public" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    if (techStack && techStack.length > 0) {
      query.techStack = { $in: techStack };
    }
    if (projectStatus) {
      query.projectStatus = projectStatus;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const projects = await Project.find(query)
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.status(200).send({
      success: true,
      data: projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// Get all projects for current user (paginated)
router.post("/get-all-projects-paginated", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find({
      owner: req.body.userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments({ owner: req.body.userId });

    res.status(200).send({
      success: true,
      data: projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// Get projects by role (paginated)
router.post("/get-projects-by-role-paginated", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.body.userId;

    const projects = await Project.find({ "members.user": userId })
      .sort({ createdAt: -1 })
      .populate("owner")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments({ "members.user": userId });

    res.status(200).send({
      success: true,
      data: projects,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/add-member", authMiddleware, async (req, res) => {
  try {
    const { email, role, projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }
    // Only owner or admin can add members
    const isOwnerOrAdmin =
      project.owner.toString() === req.body.userId ||
      project.members.some(
        (member) =>
          member.user.toString() === req.body.userId &&
          (member.role === "admin" || member.role === "owner")
      );
    if (!isOwnerOrAdmin) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to add members",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    await Project.findByIdAndUpdate(projectId, {
      $push: {
        members: {
          user: user._id,
          role,
        },
      },
    });

    res.status(200).send({
      success: true,
      message: "Member added successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/remove-member", authMiddleware, async (req, res) => {
  try {
    const { memberId, projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "Project not found",
      });
    }
    // Only owner or admin can remove members
    const isOwnerOrAdmin =
      project.owner.toString() === req.body.userId ||
      project.members.some(
        (member) =>
          member.user.toString() === req.body.userId &&
          (member.role === "admin" || member.role === "owner")
      );
    if (!isOwnerOrAdmin) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to remove members",
      });
    }

    project.members.pull(memberId);
    await project.save();

    res.status(200).send({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;