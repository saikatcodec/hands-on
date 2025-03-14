const express = require("express");
const router = express.Router();
const impactController = require("../controllers/impactController");
const { authenticateUser } = require("../middlewares/auth");

// Public routes
router.get("/leaderboard", impactController.getLeaderboard);

// Protected routes
router.post("/hours", authenticateUser, impactController.logVolunteerHours);
router.put(
  "/hours/:id/verify",
  authenticateUser,
  impactController.verifyVolunteerHours
);
router.get("/profile", authenticateUser, impactController.getUserImpact);
router.get(
  "/profile/:userId",
  authenticateUser,
  impactController.getUserImpact
);

module.exports = router;
