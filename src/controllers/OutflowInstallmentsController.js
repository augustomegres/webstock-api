const User = require("../models/User");
const {
  validateMoney,
  validateType,
  validateReason,
  validateDate,
} = require("../functions/validations");
const OutflowInstallments = require("../models/OutflowInstallments");
const { Op } = require("sequelize");

/**
 {
  purchaseId: DataTypes.INTEGER,
  companyId: DataTypes.INTEGER,
  accountId: DataTypes.INTEGER,
  installmentNumber: DataTypes.INTEGER,
  installmentTotal: DataTypes.INTEGER,
  installmentValue: DataTypes.DECIMAL,
  type: DataTypes.STRING,
  reason: DataTypes.TEXT,
  dueDate: DataTypes.DATE,
  paymentDate: DataTypes.DATE,
  type: DataTypes.STRING,
 }
 */

module.exports = {
  async show(req, res) {
    const { user } = req;
    let { id } = req.params;

    /* -------------------------------------------------------------------------- */
    /*                            Retornando a parcela                            */
    /* -------------------------------------------------------------------------- */

    OutflowInstallments.findOne({
      where: { id, companyId: user.company.id },
    })
      .then((e) => {
        return res.status(200).json(e);
      })
      .catch((e) => {
        return res
          .status(400)
          .json({ error: "Houve um erro inesperado na sua solicitação", e });
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
      pageSize,
      dueDate,
      purchaseId,
      accountId,
      paginate,
    } = req.query;

    if (!page) {
      page = 1;
    }

    if (paginate == "true") {
      paginate = true;
    } else {
      paginate = false;
    }

    if (!pageSize) {
      pageSize = 15;
    }

    const where = {
      companyId: user.company.id,
    };

    /** FILTROS DE DATA DE PAGAMENTOS */
    if (paid == "true") {
      where.paymentDate = {
        [Op.ne]: null,
      };
    }

    if (accountId) {
      where.accountId = { [Op.eq]: accountId };
    }

    if (paid == "false") {
      where.paymentDate = {
        [Op.eq]: null,
      };
    }

    /** ID DA COMPRA */
    if (purchaseId) {
      where.purchaseId = {
        [Op.eq]: purchaseId,
      };
    }

    /** FILTROS DE DATA DE VENCIMENTO */
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

    if (paginate) {
      OutflowInstallments.paginate({
        page: page,
        paginate: Number(pageSize),
        where,
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
      OutflowInstallments.findAll({
        where,
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
    }
  },
  async store(req, res) {
    const { user } = req;
    let {
      accountId,
      installmentValue,
      type,
      reason,
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

    validation = validateReason(reason);
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

    await OutflowInstallments.create({
      accountId,
      companyId,
      type,
      reason,
      dueDate,
      paymentDate,
      installmentValue,
      installmentNumber,
      installmentTotal,
    })
      .then((e) => {
        return res
          .status(200)
          .json({ success: "Pagamento realizado com sucesso!", info: e });
      })
      .catch((e) => {
        return res.status(400).json({
          error: "Houve um erro não esperado ao tentar cadastrar a parcela",
          info: e,
        });
      });
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
      reason,
    } = req.body;

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

    OutflowInstallments.update(
      { dueDate, paymentDate, installmentValue, accountId, type, reason },
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
