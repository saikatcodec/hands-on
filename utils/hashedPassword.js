const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    return hashed;
  } catch (err) {
    console.log(err);
  }
};

const matchPassword = async (password, hashPass) => {
  const match = await bcrypt.compare(password, hashPass);

  return match;
};

module.exports = {
  hashPassword,
  matchPassword,
};
