const jwt = require("jsonwebtoken");
const User = require("../models/User");

require("dotenv").config();
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  /* ------------------ VERIFICANDO SE O TOKEN FOI INFORMADO ------------------ */

  if (!authHeader) {
    return res.status(401).json({ error: "O token não foi informado" });
  }

  /* --------------- VERIFICANDO SE TEM 2 PARTES (Bearer Token) --------------- */

  const parts = authHeader.split(" ");
  if (!parts.length === 2) {
    return res.status(401).json({ error: "O token informado é inválido!" });
  }

  const [scheme, token] = parts;

  /* ---------------- VERIFICANDO SE A PRIMEIRA PARTE É BEARER ---------------- */

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "O token informado é inválido" });
  }

  jwt.verify(token, process.env.SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }

    let userId = decoded.id;

    let user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: [
          "passwordHash",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    req.user = user;

    return next();
  });
};
