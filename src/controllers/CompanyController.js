const Company = require("../models/Company");
const User = require("../models/User");
const Account = require("../models/Account");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { user } = req;
    const { companyId, enabled } = req.query;

    let where = {};
    if (companyId) {
      where.id = { [Op.eq]: companyId };
    }

    if (!enabled) {
      where.enabled = { [Op.eq]: true };
    }

    await User.findOne({
      where: { id: user.id },
      attributes: {
        exclude: [
          "passwordHash",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
      include: [
        {
          where,
          association: "companies",
          include: [{ association: "members" }],
        },
      ],
    }).then((companies) => {
      return res.status(200).json(companies);
    });
  },
  async store(req, res) {
    const { user } = req;
    const { name, cnpj, city, address, street, number } = req.body;

    await Company.create({
      name,
      cnpj,
      city,
      address,
      number,
      street,
      ownerId: user.id,
      lastSeen: new Date(),
    })
      .then(async (company) => {
        await Account.create({
          name: "Caixa",
          accountType: "Caixa",
          main: true,
          companyId: company.id,
        });
        company.addMember(user);
        res.status(200).json({ error: company });
      })
      .catch((error) => {
        res.status(400).json({ error: error });
      });
  },
  async update(req, res) {
    const { user } = req;
    const { name, cnpj, city, address, street, number } = req.body;
    const { companyId } = req.params;

    const company = await Company.findOne({
      where: { ownerId: user.id, id: companyId, enabled: true },
    });

    if (!company) {
      return res.status(400).json({ error: "Você não é dono desta empresa" });
    }

    await Company.update(
      { name, cnpj, city, address, street, number },
      { where: { ownerId: user.id, id: { [Op.eq]: companyId }, enabled: true } }
    )
      .then((response) => {
        return res.status(200).json(company);
      })
      .catch((error) => {
        return res
          .status(400)
          .json({ error: "Houve um erro ao rentar atualizar esta empresa." });
      });
  },
  async delete(req, res) {
    const { user } = req;
    const { companyId } = req.params;

    const company = await Company.findOne({
      where: { ownerId: user.id, id: companyId },
    });

    if (!company) {
      return res.status(400).json({ error: "Você não é dono desta empresa." });
    }

    await Company.update(
      { enabled: false },
      { where: { ownerId: user.id, id: { [Op.eq]: companyId } } }
    )
      .then((response) => {
        return res.status(200).json({
          success: `A empresa ${company.name} foi deletada com sucesso.`,
        });
      })
      .catch((error) => {
        return res
          .status(400)
          .json({ error: `Houve um erro ao rentar atualizar esta empresa.` });
      });
  },
};
