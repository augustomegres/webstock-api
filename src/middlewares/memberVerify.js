require("dotenv").config();
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const { user } = req;
  const { companyId } = req.params;

  try {
    let searchUser = await User.findOne({
      where: { id: user.id },
      include: [
        {
          association: "companies",
          where: { id: companyId, enabled: true },
          required: false,
        },
      ],
    });

    if (!searchUser) {
      return res.status(400).json({
        error: "Você não tem permissão para esta requisição.",
      });
    } else if (!searchUser.companies.length) {
      return res.status(400).json({
        error: "Você não tem acesso a esta empresa.",
      });
    }
    return next();
  } catch (e) {
    return res.status(400).json({
      error: "Houve um erro inesperado",
      info: e,
    });
  }
};
