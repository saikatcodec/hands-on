const models = require("../models");
const appError = require("../utils/appError");

// Get all events with optional filters
const getAllEvents = async (req, res, next) => {
  try {
    const { category, location, status } = req.query;

    const whereClause = {};

    if (category) whereClause.category = category;
    if (location) whereClause.location = location;
    if (status) whereClause.status = status;

    const events = await models.events.findAll({
      where: whereClause,
      include: [
        {
          model: models.users,
          as: "organizer",
          attributes: ["id", "fullname", "email"],
        },
      ],
      order: [["date", "ASC"]],
    });

    return res.status(200).json({
      status: "success",
      results: events.length,
      data: events,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Get event by ID
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await models.events.findByPk(id, {
      include: [
        {
          model: models.users,
          as: "organizer",
          attributes: ["id", "fullname", "email"],
        },
        {
          model: models.users,
          through: { attributes: ["status"] },
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    if (!event) {
      return next(appError("Event not found", 404));
    }

    return res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Create a new event
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      maxParticipants,
      skillsNeeded,
    } = req.body;

    if (!title || !description || !date || !location || !category) {
      return next(appError("Please provide all required fields", 400));
    }

    const newEvent = await models.events.create({
      title,
      description,
      date,
      location,
      category,
      organizerId: req.user.id,
      maxParticipants,
      skillsNeeded,
    });

    return res.status(201).json({
      status: "success",
      data: newEvent,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Update an event
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      location,
      category,
      maxParticipants,
      skillsNeeded,
      status,
    } = req.body;

    const event = await models.events.findByPk(id);

    if (!event) {
      return next(appError("Event not found", 404));
    }

    // Check if user is the organizer
    if (event.organizerId !== req.user.id) {
      return next(appError("You are not authorized to update this event", 403));
    }

    await event.update({
      title: title || event.title,
      description: description || event.description,
      date: date || event.date,
      location: location || event.location,
      category: category || event.category,
      maxParticipants: maxParticipants || event.maxParticipants,
      skillsNeeded: skillsNeeded || event.skillsNeeded,
      status: status || event.status,
    });

    return res.status(200).json({
      status: "success",
      data: event,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Delete an event
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await models.events.findByPk(id);

    if (!event) {
      return next(appError("Event not found", 404));
    }

    // Check if user is the organizer
    if (event.organizerId !== req.user.id) {
      return next(appError("You are not authorized to delete this event", 403));
    }

    await event.destroy();

    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Join an event
const joinEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await models.events.findByPk(id);

    if (!event) {
      return next(appError("Event not found", 404));
    }

    // Check if event is upcoming
    if (event.status !== "upcoming") {
      return next(appError("You can only join upcoming events", 400));
    }

    // Check if user is already registered
    const existingRegistration = await models.userEvents.findOne({
      where: {
        userId: req.user.id,
        eventId: id,
      },
    });

    if (existingRegistration) {
      return next(appError("You are already registered for this event", 400));
    }

    // Check if the event has reached maximum participants
    if (event.maxParticipants) {
      const participantsCount = await models.userEvents.count({
        where: { eventId: id },
      });

      if (participantsCount >= event.maxParticipants) {
        return next(appError("Event has reached maximum participants", 400));
      }
    }

    // Register user for the event
    await models.userEvents.create({
      userId: req.user.id,
      eventId: id,
      status: "registered",
    });

    return res.status(200).json({
      status: "success",
      message: "Successfully joined the event",
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
};
