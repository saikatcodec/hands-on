const express = require("express");
require("dotenv").config();

//importing the database
const db = require("./models");
// Error Middleware
const errorHandler = require("./middlewares/globalErrHandler");
// Importing the routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const helpRequestRoutes = require("./routes/helpRequestRoutes");
const teamRoutes = require("./routes/teamRoutes");
const impactRoutes = require("./routes/impactRoutes");

const app = express();
app.use(express.json());

//synchronizing the database and forcing it to false so we dont lose data
db.sequelize.sync().then(() => {
  console.log("db has been re sync");
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/help-requests", helpRequestRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/impact", impactRoutes);

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
