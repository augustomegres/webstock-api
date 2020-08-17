const Account = require("../models/Account");
const Company = require("../models/Company");
const { Op } = require("sequelize");

module.exports = {
  async store(req, res) {
    const { user } = req;
    const { companyId } = req.params;

    const {
      name,
      accountType,
      accountBank,
      agencyNumber,
      accountNumber,
    } = req.body;

    /* --------------------- VALIDANDO INFORMAÇÕES RECEBIDAS -------------------- */

    if (!name) {
      return res.status(400).json({ error: "O nome deve ser informado!" });
    }

    if (!accountType) {
      return res
        .status(400)
        .json({ error: "O tipo de conta deve ser informado!" });
    }

    /* ----------------------------- CRIANDO A CONTA ---------------------------- */

    try {
      const newAccount = await Account.create({
        name,
        accountType,
        accountBank,
        agencyNumber,
        accountNumber,
        companyId: companyId,
      });
      return res.status(200).json(newAccount);
    } catch (e) {
      return res.status(400).json({
        error: "Não foi possível criar sua conta devido a um erro interno!",
      });
    }
  },
  async index(req, res) {
    const { user } = req;
    const { companyId } = req.params;
    let { main } = req.query;

    let where = { companyId: companyId };

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
    const { user } = req;
    const { id, companyId } = req.params;

    const account = await Account.findOne({
      where: { id: id, companyId: companyId },
    });

    if (!account)
      return res
        .status(400)
        .json({ error: "Esta conta não existe ou não pertence a você" });

    return res.status(200).json(account);
  },
  async delete(req, res) {
    const { id, companyId } = req.params;
    const { user } = req;

    const company = await Company.findByPk(companyId, {
      include: [{ association: "accounts" }],
    });

    if (company.accounts.length <= 1) {
      return res.status(400).json({
        error:
          "Você não pode deletar todas suas contas, deve-se manter ao menos uma",
      });
    }

    const account = await Account.findByPk(id);

    if (!account) {
      return res.status(404).json({ error: "A conta informada não existe" });
    }

    try {
      await Account.destroy({ where: { id, companyId: companyId } });

      return res.status(200).json({ success: "Conta deletada com sucesso!" });
    } catch (e) {
      return res.status(400).json({ error: "Houve um erro inesperado" });
    }
  },
  async update(req, res) {
    const { user } = req;

    const {
      name,
      main,
      accountType,
      accountBank,
      agencyNumber,
      accountNumber,
    } = req.body;

    const { id, companyId } = req.params;

    const accountExist = await Account.findOne({
      where: { id, companyId: companyId },
    });

    if (!accountExist) {
      return res.status(400).json({
        error: "A conta informada não existe.",
      });
    }

    try {
      if (main == "true") {
        await Account.update(
          { main: false },
          { where: { companyId: companyId } }
        );
      }

      let account = await Account.update(
        { name, main, accountType, accountBank, agencyNumber, accountNumber },
        { where: { companyId: companyId, id } }
      );
      return res.status(200).json(account);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro ao atualizar a conta", e });
    }
  },
};
