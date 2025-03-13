//user model
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        isEmail: true, //checks for email format
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      supportedCauses: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        comment:
          "List of causes the user supports (e.g., environmental, education, healthcare)",
      },
    },
    { timestamps: true }
  );

  return User;
};
