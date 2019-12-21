const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

function generateToken(params = {}) {
  return jwt.sign(params, process.env.SECRET, {
    expiresIn: 86400
  });
}

module.exports = {
  async authenticate(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Falha na autenticação" });
    }

    user.passwordHash = undefined;

    return res
      .status(200)
      .json({ user, token: generateToken({ id: user.id }) });
  }
};
