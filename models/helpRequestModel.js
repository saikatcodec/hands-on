module.exports = (sequelize, DataTypes) => {
  const HelpRequest = sequelize.define(
    "helpRequest",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      requesterId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      urgency: {
        type: DataTypes.ENUM("low", "medium", "urgent"),
        defaultValue: "medium",
      },
      status: {
        type: DataTypes.ENUM("open", "in-progress", "completed", "cancelled"),
        defaultValue: "open",
      },
      skillsRequired: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
    },
    { timestamps: true }
  );

  return HelpRequest;
};
