const User = require("../models/User");
const Account = require("../models/Account");
const Company = require("../models/Company");
const { Op } = require("sequelize");
const Yup = require("yup");

module.exports = {
  async store(req, res) {
    const { userId } = req;

    const {
      name,
      value,
      accountType,
      accountBank,
      agencyNumber,
      accountNumber,
    } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().min(3).max(64).required(),
      value: Yup.number(),
      accountType: Yup.string().min(3).max(64).required(),
      accountBank: Yup.string().min(3).max(64),
      accountNumber: Yup.string().min(1).max(64),
      agencyNumber: Yup.string().min(1).max(16),
    });

    const isValid = await schema.isValid({
      name,
      value,
      accountType,
      accountBank,
      accountNumber,
      agencyNumber,
    });

    if (!isValid)
      return res
        .status(400)
        .json({ error: "Verifique os dados enviados e tente novamente!" });

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

    try {
      const newAccount = await Account.create({
        name,
        value,
        accountType,
        accountBank,
        agencyNumber,
        accountNumber,
        companyId: user.company.id,
      });
      return res.status(200).json(newAccount);
    } catch (e) {
      return res.status(400).json({
        error: "Não foi possível criar sua conta devido a um erro interno!",
      });
    }
  },
  async index(req, res) {
    const { userId } = req;
    let { main } = req.query;

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

    if (!user) return res.status(400).json({ error: "Usuário não existe!" });

    let where = { companyId: user.company.id };

    if (main == "true" || main == 1) {
      where.main = { [Op.eq]: true };
    }

    const accounts = await Account.findAll({
      where,
    });

    if (!accounts)
      return res
        .status(400)
        .json({ error: "Houve um erro ao requisitar as contas" });

    return res.status(200).json(accounts);
  },
  async show(req, res) {
    const { userId } = req;
    const { id } = req.params;

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

    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const account = await Account.findOne({
      where: { id: id, companyId: user.company.id },
    });

    if (!account)
      return res
        .status(400)
        .json({ error: "Esta conta não existe ou não pertence a você" });

    return res.status(200).json(account);
  },
  async delete(req, res) {
    const { id } = req.params;
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

    const company = await Company.findByPk(user.company.id, {
      include: [{ association: "accounts" }],
    });

    if (company.accounts.length <= 1) {
      return res.status(400).json({
        error:
          "Você não pode deletar todas suas contas, deve-se manter ao menos uma",
      });
    }

    try {
      await Account.destroy({ where: { id, companyId: company.id } });
    } catch (e) {
      res.status(400).json({ error: "Houve um erro inesperado" });
    }

    return;
  },
};
