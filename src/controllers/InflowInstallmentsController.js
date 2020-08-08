const User = require("../models/User");
const InflowInstallments = require("../models/InflowInstallments");
const { Op } = require("sequelize");
const {
  validateMoney,
  validateType,
  validateDate,
  validateNote,
} = require("../functions/validations");

module.exports = {
  async show(req, res) {
    const { user } = req;
    let { id } = req.params;

    /* -------------------------------------------------------------------------- */
    /*                            Retornando a parcela                            */
    /* -------------------------------------------------------------------------- */
    InflowInstallments.findOne({
      where: { id, companyId: user.company.id },
      include: [{ association: "account" }],
    })
      .then((e) => {
        if (!e) {
          throw { error: "A parcela informada não existe" };
        }

        return res.status(200).json(e);
      })
      .catch((e) => {
        return res.status(400).json({
          error: "Houve um erro inesperado na sua solicitação",
          info: e,
        });
      });
  },
  async store(req, res) {
    const { user } = req;
    let {
      accountId,
      installmentValue,
      type,
      note,
      dueDate,
      paymentDate,
    } = req.body;

    let validation = {};

    /* -------------------------------------------------------------------------- */
    /*                       Validando o formato dos valores                      */
    /* -------------------------------------------------------------------------- */

    if (!accountId) {
      return res.status(400).json({ error: "A conta deve ser informada!" });
    }

    validation = validateMoney(installmentValue, true);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    validation = validateType(type, true);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    validation = validateNote(note);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    validation = validateDate(dueDate, true);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    validation = validateDate(paymentDate);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    /* -------------------------------------------------------------------------- */
    /*                  Verificando se a conta pertence a empresa                 */
    /* -------------------------------------------------------------------------- */

    if (!user.company) {
      return res
        .status(400)
        .json({ error: "A conta informada não percente a sua empresa" });
    }

    /* -------------------------------------------------------------------------- */
    /*                   Armazenando valores fixos em variáveis                   */
    /* -------------------------------------------------------------------------- */

    let companyId = user.company.id;
    let installmentNumber = 1;
    let installmentTotal = 1;

    /* -------------------------------------------------------------------------- */
    /*                             Cadastrando parcela                            */
    /* -------------------------------------------------------------------------- */

    await InflowInstallments.create({
      accountId,
      companyId,
      type,
      note,
      dueDate,
      paymentDate,
      installmentValue,
      installmentNumber,
      installmentTotal,
    })
      .then((e) => {
        return res
          .status(200)
          .json({ success: "Recebimento cadastrado com sucesso!", info: e });
      })
      .catch((e) => {
        return res.status(400).json({
          error: "Houve um erro não esperado ao tentar cadastrar a parcela",
          info: e,
        });
      });
  },
  async index(req, res) {
    const { user } = req;
    let {
      paid,
      min_date_time,
      max_date_time,
      min_value,
      max_value,
      page,
      type,
      pageSize,
      dueDate,
      purchaseId,
      accountId,
      paginate,
    } = req.query;

    if (!page) {
      page = 1;
    }

    if (!paginate) {
      paginate = "true";
    }

    if (!pageSize) {
      pageSize = 15;
    }

    const where = {
      companyId: user.company.id,
    };

    if (accountId) {
      where.accountId = { [Op.eq]: accountId };
    }

    if (type) {
      where.type = { [Op.substring]: type };
    }

    if (paid == "false") {
      where.paymentDate = {
        [Op.eq]: null,
      };
    } else if (paid == "true") {
      where.paymentDate = {
        [Op.ne]: null,
      };
    }

    if (purchaseId) {
      where.purchaseId = {
        [Op.eq]: purchaseId,
      };
    }

    if (dueDate) {
      var searchOrder = [];
      searchOrder.push(["dueDate", dueDate]);
    } else {
      var searchOrder = [];
    }

    if (min_date_time || max_date_time) {
      let min_date = new Date("1980-01-01");
      let max_date = new Date("2100-01-01");

      where.dueDate = {
        [Op.and]: {
          [Op.gte]: new Date(`${min_date_time}`) || min_date,
          [Op.lte]: new Date(`${max_date_time}`) || max_date,
        },
      };
    }

    //Insere o valor mínimo dos dados
    if (min_value) {
      let value = Number(min_value);
      if (isNaN(value)) {
        value = 0;
      }

      where.installmentValue = {
        ...where.installmentValue,
        [Op.gte]: value,
      };
    }

    //Insere o valor máximo dos dados
    if (max_value) {
      let value = Number(max_value);
      if (isNaN(value)) {
        value = 9999999999999;
      }

      where.installmentValue = {
        ...where.installmentValue,
        [Op.lte]: value,
      };
    }
    if (paginate == "true") {
      InflowInstallments.paginate({
        page: page,
        paginate: Number(pageSize),
        where,
        include: [
          { association: "sales", include: [{ association: "customers" }] },
        ],
        order: searchOrder,
      })
        .then((e) => {
          return res.status(200).json(e);
        })
        .catch((e) => {
          return res
            .status(400)
            .json({ error: "Houve um erro inesperado", info: e });
        });
    } else {
      InflowInstallments.findAll({
        where,
        order: searchOrder,
        include: [
          { association: "sales", include: [{ association: "customers" }] },
        ],
      })
        .then((e) => {
          return res.status(200).json(e);
        })
        .catch((e) => {
          return res
            .status(400)
            .json({ error: "Houve um erro inesperado", info: e });
        });
    }
  },
  async update(req, res) {
    const { user } = req;
    const { id } = req.params;
    const {
      dueDate,
      paymentDate,
      installmentValue,
      accountId,
      type,
      note,
    } = req.body;

    if (!accountId) {
      return res.status(400).json({
        error:
          "É necessário enviar o accountId em qualquer requisição de atualização",
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                       Validando o formato dos valores                      */
    /* -------------------------------------------------------------------------- */
    validation = validateDate(dueDate);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    validation = validateDate(paymentDate);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    /* -------------------------------------------------------------------------- */
    /*                  Verificando se a conta pertence a empresa                 */
    /* -------------------------------------------------------------------------- */

    if (!user.company) {
      return res
        .status(400)
        .json({ error: "A conta informada não percente a sua empresa!" });
    }

    /* -------------------------------------------------------------------------- */
    /*                            Atualizando a parcela                           */
    /* -------------------------------------------------------------------------- */

    InflowInstallments.update(
      { dueDate, paymentDate, installmentValue, accountId, type, note },
      { where: { id, companyId: user.company.id } }
    )
      .then((e) => {
        return res
          .status(200)
          .json({ success: "Parcela atualizada com sucesso!", info: e });
      })
      .catch((e) => {
        return res
          .status(400)
          .json({ error: "Houve um erro ao atualizar as parcelas", info: e });
      });
  },
};
