const jwt = require("jsonwebtoken");
const getUser = require("../functions/getUser");

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

    let user = await getUser(userId);

    if (user.error) {
      return res.status(400).json(user);
    }

    req.user = user;

    return next();
  });
};
