const User = require("../models/User");
const Seller = require("../models/Seller");

module.exports = {
  async index(req, res) {
    const { user } = req;

    if (!user) return res.status(400).json({ error: "O usuário não existe!" });

    const sellers = await Seller.findAll({
      where: { companyId: user.company.id },
    });

    return res.status(200).json(sellers);
  },
  async store(req, res) {
    const { user } = req;
    const { name } = req.body;

    if (!user) return res.status(400).json({ error: "O usuário não existe!" });

    const newSeller = await Seller.create({
      name,
      companyId: user.company.id,
    });

    return res.status(200).json({ newSeller });
  },
};
