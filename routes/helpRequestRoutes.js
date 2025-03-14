const express = require("express");
const router = express.Router();
const helpRequestController = require("../controllers/helpRequestController");
const { authenticateUser } = require("../middlewares/auth");

// Public routes
router.get("/", helpRequestController.getAllHelpRequests);
router.get("/:id", helpRequestController.getHelpRequestById);

// Protected routes
router.post("/", authenticateUser, helpRequestController.createHelpRequest);
router.put("/:id", authenticateUser, helpRequestController.updateHelpRequest);
router.delete(
  "/:id",
  authenticateUser,
  helpRequestController.deleteHelpRequest
);
router.post(
  "/:id/offer-help",
  authenticateUser,
  helpRequestController.offerHelp
);

module.exports = router;
