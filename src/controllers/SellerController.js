const User = require("../models/User");
const Seller = require("../models/Seller");

module.exports = {
  async index(req, res) {
    const { userId } = req;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    if (!user) return res.status(400).json({ error: "O usuário não existe!" });

    const sellers = await Seller.findAll({
      where: { companyId: user.company.id },
    });

    return res.status(200).json(sellers);
  },
  async store(req, res) {
    const { userId } = req;
    const { name } = req.body;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    if (!user) return res.status(400).json({ error: "O usuário não existe!" });

    const newSeller = await Seller.create({
      name,
      companyId: user.company.id,
    });

    return res.status(200).json({ newSeller });
  },
};
