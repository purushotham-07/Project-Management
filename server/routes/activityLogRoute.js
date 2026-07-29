const router = require("express").Router();
const ActivityLog = require("../models/activityLogModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/get-activity-logs", authMiddleware, async (req, res) => {
  try {
    if (!req.body.project) {
      return res.status(400).send({
        success: false,
        message: "Project ID is required",
      });
    }
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find({ project: req.body.project })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments({ project: req.body.project });

    res.status(200).send({
      success: true,
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;