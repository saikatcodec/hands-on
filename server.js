const express = require("express");
require("dotenv").config();

//importing the database
const db = require("./models");
// Error Middleware
const errorHandler = require("./middlewares/globalErrHandler");
// Importing the routes
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

//synchronizing the database and forcing it to false so we dont lose data
db.sequelize.sync().then(() => {
  console.log("db has been re sync");
});

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
