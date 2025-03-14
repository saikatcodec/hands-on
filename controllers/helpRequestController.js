const models = require("../models");
const appError = require("../utils/appError");

// Get all help requests with optional filters
const getAllHelpRequests = async (req, res, next) => {
  try {
    const { urgency, status, location } = req.query;

    const whereClause = {};

    if (urgency) whereClause.urgency = urgency;
    if (status) whereClause.status = status;
    if (location) whereClause.location = location;

    const helpRequests = await models.helpRequests.findAll({
      where: whereClause,
      include: [
        {
          model: models.users,
          as: "requester",
          attributes: ["id", "fullname", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      results: helpRequests.length,
      data: helpRequests,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Get help request by ID
const getHelpRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const helpRequest = await models.helpRequests.findByPk(id, {
      include: [
        {
          model: models.users,
          as: "requester",
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    if (!helpRequest) {
      return next(appError("Help request not found", 404));
    }

    return res.status(200).json({
      status: "success",
      data: helpRequest,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Create a new help request
const createHelpRequest = async (req, res, next) => {
  try {
    const { title, description, location, urgency, skillsRequired } = req.body;

    if (!title || !description) {
      return next(appError("Please provide all required fields", 400));
    }

    const newHelpRequest = await models.helpRequests.create({
      title,
      description,
      location,
      urgency: urgency || "medium",
      requesterId: req.user.id,
      skillsRequired: skillsRequired || [],
    });

    return res.status(201).json({
      status: "success",
      data: newHelpRequest,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Update a help request
const updateHelpRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, location, urgency, skillsRequired, status } =
      req.body;

    const helpRequest = await models.helpRequests.findByPk(id);

    if (!helpRequest) {
      return next(appError("Help request not found", 404));
    }

    // Check if user is the requester
    if (helpRequest.requesterId !== req.user.id) {
      return next(
        appError("You are not authorized to update this help request", 403)
      );
    }

    await helpRequest.update({
      title: title || helpRequest.title,
      description: description || helpRequest.description,
      location: location || helpRequest.location,
      urgency: urgency || helpRequest.urgency,
      skillsRequired: skillsRequired || helpRequest.skillsRequired,
      status: status || helpRequest.status,
    });

    return res.status(200).json({
      status: "success",
      data: helpRequest,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Delete a help request
const deleteHelpRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const helpRequest = await models.helpRequests.findByPk(id);

    if (!helpRequest) {
      return next(appError("Help request not found", 404));
    }

    // Check if user is the requester
    if (helpRequest.requesterId !== req.user.id) {
      return next(
        appError("You are not authorized to delete this help request", 403)
      );
    }

    await helpRequest.destroy();

    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Offer help for a request
const offerHelp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const helpRequest = await models.helpRequests.findByPk(id);

    if (!helpRequest) {
      return next(appError("Help request not found", 404));
    }

    // Update the status to in-progress if it's open
    if (helpRequest.status === "open") {
      await helpRequest.update({ status: "in-progress" });
    }

    // Here you would typically create a comment or offer record
    // For now, we'll just return a success message

    return res.status(200).json({
      status: "success",
      message: "Help offered successfully",
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = {
  getAllHelpRequests,
  getHelpRequestById,
  createHelpRequest,
  updateHelpRequest,
  deleteHelpRequest,
  offerHelp,
};
