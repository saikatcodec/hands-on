const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { authenticateUser } = require("../middlewares/auth");

// Public routes
router.get("/", teamController.getAllTeams);
router.get("/:id", teamController.getTeamById);

// Protected routes
router.post("/", authenticateUser, teamController.createTeam);
router.put("/:id", authenticateUser, teamController.updateTeam);
router.post("/:id/join", authenticateUser, teamController.joinTeam);
router.post("/:id/leave", authenticateUser, teamController.leaveTeam);

module.exports = router;
