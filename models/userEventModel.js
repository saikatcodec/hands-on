module.exports = (sequelize, DataTypes) => {
  const UserEvent = sequelize.define(
    "userEvent",
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("registered", "attended", "cancelled"),
        defaultValue: "registered",
      },
    },
    { timestamps: true }
  );

  return UserEvent;
};
