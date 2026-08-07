const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://client-six-beige-64.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Node JS server listening on port ${PORT}`);
});