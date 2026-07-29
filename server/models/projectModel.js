const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const projectSchema = new mongoose.Schema(
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
      default: "active",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    members: [memberSchema],
    tags: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    projectStatus: {
      type: String,
      enum: ["Planning", "Active", "On Hold", "Completed"],
      default: "Active",
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Private",
    },
    deadline: {
      type: Date,
      default: null,
    },
    coverImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("projects", projectSchema);