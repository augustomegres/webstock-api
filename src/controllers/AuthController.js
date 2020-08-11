const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const getUser = require("../functions/getUser");

require("dotenv").config();
function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 604800,
  });
}

module.exports = {
  async authenticate(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Verifique seu email e tente novamente." });
    }

    const userIsValid = await getUser(user.id);

    if (userIsValid.error) {
      return res.status(400).json(userIsValid);
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Sua senha está incorreta." });
    }

    user.passwordHash = undefined;

    return res
      .status(200)
      .json({ user, token: generateToken({ id: user.id }) });
  },
};
