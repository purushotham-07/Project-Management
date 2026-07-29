const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/register",
  [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
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

      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        return res.status(400).send({
          success: false,
          message: "User already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;

      const user = new User(req.body);
      await user.save();
      res.status(201).send({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
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

      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(400).send({
          success: false,
          message: "User does not exist",
        });
      }

      const passwordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!passwordCorrect) {
        return res.status(400).send({
          success: false,
          message: "Invalid password",
        });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).send({
        success: true,
        data: token,
        message: "User logged in successfully",
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

router.get("/get-logged-in-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.password = undefined;

    res.status(200).send({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;