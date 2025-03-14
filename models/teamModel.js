module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    "team",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      founderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      focus: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      totalImpact: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: true }
  );

  return Team;
};
