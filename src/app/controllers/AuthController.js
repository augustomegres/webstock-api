const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json");

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400
  });
}

module.exports = {
  async authenticate(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(400).json({ error: "Falha na autenticação" });
    }

    user.passwordHash = undefined;

    return res
      .status(400)
      .json({ user, token: generateToken({ id: user.id }) });
  }
};
