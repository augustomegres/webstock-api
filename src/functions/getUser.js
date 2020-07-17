const User = require("../models/User");

const getUser = async (userId) => {
  /* ----------------------- CAPTURANDO USUARIO PELO ID ----------------------- */

  const user = await User.findByPk(userId, {
    include: [{ association: "company" }, { association: "employee_company" }],
    attributes: {
      exclude: [
        "passwordHash",
        "passwordRecoverToken",
        "recoverPasswordTokenExpires",
      ],
    },
  });

  /* ----------------------- AJUSTANDO OBJETO DE EMPRESA ---------------------- */

  switch (user.type) {
    case "user":
      user.dataValues.employee_company = undefined;
      break;
    case "employee":
      user.dataValues.company = user.employee_company[0];
      user.company = user.employee_company[0];
      user.dataValues.employee_company = undefined;
      break;
    default:
      break;
  }

  if (!user.enabled) {
    return { error: "Você não tem permissão para acessar a aplicação!" };
  }

  return user;
};

module.exports = getUser;
