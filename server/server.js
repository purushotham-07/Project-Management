const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());

// CORS configuration - allow Vercel frontend and localhost
const cors = require("cors");
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://client-six-beige-64.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
}));

const dbConfig = require("./config/dbConfig");
const port = process.env.PORT || 5000;

const usersRoute = require("./routes/usersRoute");
const projectsRoute = require("./routes/projectsRoute");
const tasksRoute = require("./routes/tasksRoute");
const notificationsRoute = require("./routes/notificationsRoute");
const commentsRoute = require("./routes/commentsRoute");
const activityLogRoute = require("./routes/activityLogRoute");
const joinRequestRoute = require("./routes/joinRequestRoute");

app.use("/api/users", usersRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/activity-logs", activityLogRoute);
app.use("/api/join-requests", joinRequestRoute);


const path = require("path");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
  });
}

app.listen(port, () => console.log(`Node JS server listening on port ${port}`));