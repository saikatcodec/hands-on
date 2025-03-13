//importing modules
const { Sequelize, DataTypes } = require("sequelize");
const User = require("./userModel");

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

//connecting to model
db.users = User(sequelize, DataTypes);

//exporting the module
module.exports = db;
