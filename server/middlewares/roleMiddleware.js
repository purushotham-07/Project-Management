const Project = require("../models/projectModel");

/**
 * Middleware to check if the authenticated user has a specific role (or higher)
 * in a project. Attaches the user's role to req.currentUserRole.
 * Usage: router.post("/route", authMiddleware, checkProjectRole(["owner", "admin"]), handler)
 */
const checkProjectRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.body.projectId || req.body._id || req.params?.id;
      if (!projectId) {
        return res.status(400).send({
          success: false,
          message: "Project ID is required",
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).send({
          success: false,
          message: "Project not found",
        });
      }

      // Check if user is the owner
      if (project.owner.toString() === req.body.userId) {
        req.currentUserRole = "owner";
        return next();
      }

      // Check members array
      const member = project.members.find(
        (m) => m.user.toString() === req.body.userId
      );
      if (!member) {
        return res.status(403).send({
          success: false,
          message: "You are not a member of this project",
        });
      }

      req.currentUserRole = member.role;

      // Check if the user's role is in the allowed roles list
      if (!allowedRoles.includes(member.role)) {
        return res.status(403).send({
          success: false,
          message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = { checkProjectRole };