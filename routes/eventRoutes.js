const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateUser } = require("../middlewares/auth");

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

// Protected routes
router.post("/", authenticateUser, eventController.createEvent);
router.put("/:id", authenticateUser, eventController.updateEvent);
router.delete("/:id", authenticateUser, eventController.deleteEvent);
router.post("/:id/join", authenticateUser, eventController.joinEvent);

module.exports = router;
