const models = require("../models");
const appError = require("../utils/appError");

// Log volunteer hours
const logVolunteerHours = async (req, res, next) => {
  try {
    const { eventId, helpRequestId, hours, description } = req.body;

    if (!hours || (!eventId && !helpRequestId)) {
      return next(
        appError("Please provide hours and an event or help request", 400)
      );
    }

    // Validate the event/help request exists
    if (eventId) {
      const event = await models.events.findByPk(eventId);
      if (!event) {
        return next(appError("Event not found", 404));
      }

      // Check if user is registered for this event
      const registration = await models.userEvents.findOne({
        where: { userId: req.user.id, eventId },
      });

      if (!registration) {
        return next(appError("You are not registered for this event", 400));
      }

      // Update status to attended
      await registration.update({ status: "attended" });
    }

    if (helpRequestId) {
      const helpRequest = await models.helpRequests.findByPk(helpRequestId);
      if (!helpRequest) {
        return next(appError("Help request not found", 404));
      }
    }

    // Calculate points (5 points per hour)
    const points = hours * 5;

    // Determine verification status
    let status = "pending";

    // Create volunteer hours record
    const volunteerHours = await models.volunteerHours.create({
      userId: req.user.id,
      eventId,
      helpRequestId,
      hours,
      description,
      status,
      points: status === "verified" ? points : 0,
    });

    return res.status(201).json({
      status: "success",
      data: volunteerHours,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Verify volunteer hours (peer verification)
const verifyVolunteerHours = async (req, res, next) => {
  try {
    const { id } = req.params;

    const volunteerHours = await models.volunteerHours.findByPk(id);

    if (!volunteerHours) {
      return next(appError("Volunteer hours record not found", 404));
    }

    // User cannot verify their own hours
    if (volunteerHours.userId === req.user.id) {
      return next(appError("You cannot verify your own volunteer hours", 400));
    }

    // Update the status to verified and award points
    await volunteerHours.update({
      status: "verified",
      points: volunteerHours.hours * 5,
    });

    return res.status(200).json({
      status: "success",
      message: "Volunteer hours verified successfully",
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Get user's volunteer history and certificates
const getUserImpact = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;

    const volunteerHours = await models.volunteerHours.findAll({
      where: { userId, status: "verified" },
      include: [
        {
          model: models.events,
          attributes: ["id", "title", "date"],
        },
        {
          model: models.helpRequests,
          attributes: ["id", "title"],
        },
      ],
    });

    // Calculate total hours and points
    const totalHours = volunteerHours.reduce(
      (sum, record) => sum + parseFloat(record.hours),
      0
    );

    const totalPoints = volunteerHours.reduce(
      (sum, record) => sum + record.points,
      0
    );

    // Generate certificates based on milestones
    const certificates = [];
    const milestones = [20, 50, 100];

    milestones.forEach((milestone) => {
      if (totalHours >= milestone) {
        certificates.push({
          milestone,
          certificateId: `CERT-${userId}-${milestone}`,
          issuedDate: new Date(),
        });
      }
    });

    return res.status(200).json({
      status: "success",
      data: {
        volunteerHours,
        summary: {
          totalHours,
          totalPoints,
          certificates,
        },
      },
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Get leaderboard of most active volunteers and teams
const getLeaderboard = async (req, res, next) => {
  try {
    // User leaderboard based on verified hours
    const userLeaderboard = await models.users.findAll({
      attributes: [
        "id",
        "fullname",
        [
          models.sequelize.literal(
            '(SELECT COALESCE(SUM(hours), 0) FROM "volunteerHours" WHERE "userId" = "user"."id" AND status = \'verified\')'
          ),
          "totalHours",
        ],
        [
          models.sequelize.literal(
            '(SELECT COALESCE(SUM(points), 0) FROM "volunteerHours" WHERE "userId" = "user"."id")'
          ),
          "totalPoints",
        ],
      ],
      order: [[models.sequelize.literal("totalHours"), "DESC"]],
      limit: 10,
    });

    // Team leaderboard
    const teamLeaderboard = await models.teams.findAll({
      attributes: ["id", "name", "totalImpact"],
      order: [["totalImpact", "DESC"]],
      limit: 10,
    });

    return res.status(200).json({
      status: "success",
      data: {
        userLeaderboard,
        teamLeaderboard,
      },
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = {
  logVolunteerHours,
  verifyVolunteerHours,
  getUserImpact,
  getLeaderboard,
};
