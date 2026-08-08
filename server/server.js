const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(express.json());

// CORS configuration - allow Vercel frontend and localhost
const allowedOrigins = [
  "http://localhost:3000",
  "https://client-six-beige-64.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Allow configured origins and any Vercel deployment
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// Database connection
require("./config/dbConfig");

// Routes
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/projects", require("./routes/projectsRoute"));
app.use("/api/tasks", require("./routes/tasksRoute"));
app.use("/api/notifications", require("./routes/notificationsRoute"));
app.use("/api/comments", require("./routes/commentsRoute"));
app.use("/api/activity-logs", require("./routes/activityLogRoute"));
app.use("/api/join-requests", require("./routes/joinRequestRoute"));
app.use("/api/analytics", require("./routes/analyticsRoute"));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Management API is running 🚀",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Node JS server listening on port ${PORT}`);
});

// Graceful shutdown for Render
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});