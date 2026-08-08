const router = require("express").Router();
const Project = require("../models/projectModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Get dashboard analytics for current user
router.post("/get-dashboard-analytics", authMiddleware, async (req, res) => {
  try {
    const userId = req.body.userId;

    // Get all projects where user is owner or member
    const projects = await Project.find({
      $or: [{ owner: userId }, { "members.user": userId }],
    });

    const projectIds = projects.map((p) => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignedTo", "firstName lastName")
      .populate("assignedBy", "firstName lastName");

    // Project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.projectStatus === "Active"
    ).length;
    const planningProjects = projects.filter(
      (p) => p.projectStatus === "Planning"
    ).length;
    const onHoldProjects = projects.filter(
      (p) => p.projectStatus === "On Hold"
    ).length;
    const completedProjects = projects.filter(
      (p) => p.projectStatus === "Completed"
    ).length;

    // Task statistics
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter((t) => t.status === "To Do").length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === "In Progress"
    ).length;
    const doneTasks = tasks.filter((t) => t.status === "Done").length;

    // Priority distribution
    const priorityDistribution = {
      Low: tasks.filter((t) => t.priority === "Low").length,
      Medium: tasks.filter((t) => t.priority === "Medium").length,
      High: tasks.filter((t) => t.priority === "High").length,
      Urgent: tasks.filter((t) => t.priority === "Urgent").length,
    };

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Done"
    );

    // Tasks due this week
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const dueThisWeek = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= now &&
        new Date(t.dueDate) <= endOfWeek &&
        t.status !== "Done"
    );

    // Member workload (tasks assigned per member)
    const memberWorkload = {};
    tasks.forEach((task) => {
      if (task.assignedTo) {
        const name = `${task.assignedTo.firstName} ${task.assignedTo.lastName}`;
        if (!memberWorkload[name]) {
          memberWorkload[name] = { total: 0, done: 0, inProgress: 0, todo: 0 };
        }
        memberWorkload[name].total++;
        if (task.status === "Done") memberWorkload[name].done++;
        if (task.status === "In Progress") memberWorkload[name].inProgress++;
        if (task.status === "To Do") memberWorkload[name].todo++;
      }
    });

    // Task status distribution for charts
    const taskStatusDistribution = [
      { name: "To Do", value: todoTasks },
      { name: "In Progress", value: inProgressTasks },
      { name: "Done", value: doneTasks },
    ];

    // Project status distribution for charts
    const projectStatusDistribution = [
      { name: "Planning", value: planningProjects },
      { name: "Active", value: activeProjects },
      { name: "On Hold", value: onHoldProjects },
      { name: "Completed", value: completedProjects },
    ];

    // Recent tasks
    const recentTasks = tasks.slice(0, 5);

    res.status(200).send({
      success: true,
      data: {
        projectStats: {
          total: totalProjects,
          active: activeProjects,
          planning: planningProjects,
          onHold: onHoldProjects,
          completed: completedProjects,
        },
        taskStats: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          done: doneTasks,
          completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        },
        priorityDistribution,
        overdueTasks: overdueTasks.length,
        dueThisWeek: dueThisWeek.length,
        memberWorkload,
        taskStatusDistribution,
        projectStatusDistribution,
        recentTasks,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;