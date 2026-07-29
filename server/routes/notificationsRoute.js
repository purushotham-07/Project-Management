const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const Notification = require("../models/notificationsModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/add-notification",
  authMiddleware,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("user").notEmpty().withMessage("User is required"),
    body("onClick").notEmpty().withMessage("onClick is required"),
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

      const newNotification = new Notification(req.body);
      await newNotification.save();
      res.status(201).send({
        success: true,
        data: newNotification,
        message: "Notification added successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        success: false,
      });
    }
  }
);

router.post("/get-all-notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.body.userId,
    }).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/mark-as-read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.body.userId,
        read: false,
      },
      {
        read: true,
      }
    );
    const notifications = await Notification.find({
      user: req.body.userId,
    }).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "Notifications marked as read",
      data: notifications,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.delete("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "All notifications deleted",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;