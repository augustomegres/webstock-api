const User = require("../models/User");
const Company = require("../models/Company");

const getUser = async (userId) => {
  /* ----------------------- CAPTURANDO USUARIO PELO ID ----------------------- */

  const user = await User.findByPk(userId, {
    include: [{ association: "companies" }],
  });

  Company.update({ lastSeen: new Date() }, { where: { id: user.company.id } });

  /* ----------------------- AJUSTANDO OBJETO DE EMPRESA ---------------------- */

  if (!user.enabled) {
    return { error: "Você não tem permissão para acessar a aplicação!" };
  }

  return user;
};

module.exports = getUser;
