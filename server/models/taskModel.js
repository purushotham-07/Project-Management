const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "To Do",
      enum: ["To Do", "In Progress", "Done"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    attachments: {
      type: Array,
      default : []
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("tasks", taskSchema);