module.exports = (sequelize, DataTypes) => {
  const UserTeam = sequelize.define(
    "userTeam",
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("member", "admin"),
        defaultValue: "member",
      },
    },
    { timestamps: true }
  );

  return UserTeam;
};
