//importing modules
const { Sequelize, DataTypes } = require("sequelize");
const User = require("./userModel");
const Event = require("./eventModel");
const HelpRequest = require("./helpRequestModel");
const Team = require("./teamModel");
const VolunteerHours = require("./volunteerHoursModel");
const UserEvent = require("./userEventModel");
const UserTeam = require("./userTeamModel");

//Database connection with dialect of postgres specifying the database we are using
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Use this with caution in production
      },
    },
  }
);

//checking if connection is done
sequelize
  .authenticate()
  .then(() => {
    console.log(`Database connected to successfully`);
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//connecting to models
db.users = User(sequelize, DataTypes);
db.events = Event(sequelize, DataTypes);
db.helpRequests = HelpRequest(sequelize, DataTypes);
db.teams = Team(sequelize, DataTypes);
db.volunteerHours = VolunteerHours(sequelize, DataTypes);
db.userEvents = UserEvent(sequelize, DataTypes);
db.userTeams = UserTeam(sequelize, DataTypes);

// Define relationships
db.users.hasMany(db.events, {
  foreignKey: "organizerId",
  as: "organizedEvents",
});
db.events.belongsTo(db.users, { foreignKey: "organizerId", as: "organizer" });

db.users.hasMany(db.helpRequests, {
  foreignKey: "requesterId",
  as: "helpRequests",
});
db.helpRequests.belongsTo(db.users, {
  foreignKey: "requesterId",
  as: "requester",
});

db.users.hasMany(db.teams, { foreignKey: "founderId", as: "foundedTeams" });
db.teams.belongsTo(db.users, { foreignKey: "founderId", as: "founder" });

// Many-to-many relationships
db.users.belongsToMany(db.events, {
  through: db.userEvents,
  foreignKey: "userId",
});
db.events.belongsToMany(db.users, {
  through: db.userEvents,
  foreignKey: "eventId",
});

db.users.belongsToMany(db.teams, {
  through: db.userTeams,
  foreignKey: "userId",
});
db.teams.belongsToMany(db.users, {
  through: db.userTeams,
  foreignKey: "teamId",
});

// Volunteer hours relationships
db.users.hasMany(db.volunteerHours, { foreignKey: "userId" });
db.volunteerHours.belongsTo(db.users, { foreignKey: "userId" });

db.events.hasMany(db.volunteerHours, { foreignKey: "eventId" });
db.volunteerHours.belongsTo(db.events, { foreignKey: "eventId" });

db.helpRequests.hasMany(db.volunteerHours, { foreignKey: "helpRequestId" });
db.volunteerHours.belongsTo(db.helpRequests, { foreignKey: "helpRequestId" });

//exporting the module
module.exports = db;
