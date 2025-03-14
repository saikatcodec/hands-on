module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    "event",
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
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      organizerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      skillsNeeded: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM("upcoming", "ongoing", "completed", "cancelled"),
        defaultValue: "upcoming",
      },
    },
    { timestamps: true }
  );

  return Event;
};
