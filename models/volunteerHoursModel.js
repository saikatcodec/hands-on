module.exports = (sequelize, DataTypes) => {
  const VolunteerHours = sequelize.define(
    "volunteerHours",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      helpRequestId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      hours: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "verified", "rejected"),
        defaultValue: "pending",
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: true }
  );

  return VolunteerHours;
};
