const models = require("../models");
const appError = require("../utils/appError");

// Get all teams
const getAllTeams = async (req, res, next) => {
  try {
    // Only get public teams unless the user requests their own teams
    const whereClause = req.query.all === "true" ? {} : { isPrivate: false };

    const teams = await models.teams.findAll({
      where: whereClause,
      include: [
        {
          model: models.users,
          as: "founder",
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      results: teams.length,
      data: teams,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Get team by ID
const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await models.teams.findByPk(id, {
      include: [
        {
          model: models.users,
          as: "founder",
          attributes: ["id", "fullname", "email"],
        },
        {
          model: models.users,
          through: { attributes: ["role"] },
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    if (!team) {
      return next(appError("Team not found", 404));
    }

    // Check if team is private and the user is not a member
    if (team.isPrivate) {
      // Check if the user is a member
      const isMember = team.users.some((user) => user.id === req.user.id);

      if (!isMember) {
        return next(appError("This team is private", 403));
      }
    }

    return res.status(200).json({
      status: "success",
      data: team,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Create a new team
const createTeam = async (req, res, next) => {
  try {
    const { name, description, isPrivate, focus } = req.body;

    if (!name || !description) {
      return next(appError("Please provide all required fields", 400));
    }

    const newTeam = await models.teams.create({
      name,
      description,
      founderId: req.user.id,
      isPrivate: isPrivate || false,
      focus: focus || [],
    });

    // Add the founder as an admin of the team
    await models.userTeams.create({
      userId: req.user.id,
      teamId: newTeam.id,
      role: "admin",
    });

    return res.status(201).json({
      status: "success",
      data: newTeam,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Update a team
const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isPrivate, focus } = req.body;

    const team = await models.teams.findByPk(id);

    if (!team) {
      return next(appError("Team not found", 404));
    }

    // Check if the user is the founder or an admin
    const userTeam = await models.userTeams.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
        role: "admin",
      },
    });

    if (!userTeam && team.founderId !== req.user.id) {
      return next(appError("You are not authorized to update this team", 403));
    }

    await team.update({
      name: name || team.name,
      description: description || team.description,
      isPrivate: isPrivate !== undefined ? isPrivate : team.isPrivate,
      focus: focus || team.focus,
    });

    return res.status(200).json({
      status: "success",
      data: team,
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Join a team
const joinTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await models.teams.findByPk(id);

    if (!team) {
      return next(appError("Team not found", 404));
    }

    // Check if team is private
    if (team.isPrivate) {
      return next(
        appError("This team is private and requires an invitation", 403)
      );
    }

    // Check if user is already a member
    const existingMembership = await models.userTeams.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
      },
    });

    if (existingMembership) {
      return next(appError("You are already a member of this team", 400));
    }

    // Add user to team
    await models.userTeams.create({
      userId: req.user.id,
      teamId: id,
      role: "member",
    });

    return res.status(200).json({
      status: "success",
      message: "Successfully joined the team",
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

// Leave a team
const leaveTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await models.teams.findByPk(id);

    if (!team) {
      return next(appError("Team not found", 404));
    }

    // Check if user is a member
    const membership = await models.userTeams.findOne({
      where: {
        userId: req.user.id,
        teamId: id,
      },
    });

    if (!membership) {
      return next(appError("You are not a member of this team", 400));
    }

    // Founder cannot leave the team
    if (team.founderId === req.user.id) {
      return next(
        appError(
          "Team founder cannot leave. Transfer ownership or delete the team",
          400
        )
      );
    }

    // Remove user from team
    await membership.destroy();

    return res.status(200).json({
      status: "success",
      message: "Successfully left the team",
    });
  } catch (error) {
    next(appError(error.message, 500));
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  joinTeam,
  leaveTeam,
};
