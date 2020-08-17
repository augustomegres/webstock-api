const Account = require("../models/Account");
const {
  validateMoney,
  validateType,
  validateDate,
  validateNote,
} = require("../functions/validations");
const OutflowInstallments = require("../models/OutflowInstallments");
const { Op } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { id, companyId } = req.params;

    /* -------------------------------------------------------------------------- */
    /*                            Retornando a parcela                            */
    /* -------------------------------------------------------------------------- */

    OutflowInstallments.findOne({
      where: {
        id,
        companyId: companyId,
      },
      include: [{ association: "account" }],
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
    const { companyId } = req.params;
    let {
      paid,
      min_date_time,
      max_date_time,
      min_value,
      max_value,
      page,
      type,
      pageSize,
      order,
      columnToSort,
      purchaseId,
      accountId,
      paginate,
    } = req.query;

    if (!page) page = 1;
    page--;

    if (!pageSize) pageSize = 12;
    if (pageSize > 100) {
      return res
        .status(400)
        .json({ error: "O tamanho máximo da página é de 100 documentos." });
    }

    if (columnToSort && order) {
      order = [[columnToSort, order]];
    } else {
      order = null;
    }

    if (!paginate) {
      paginate = "true";
    }

    const where = {
      companyId: companyId,
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
      const offset = Number(page) * Number(pageSize);
      const limit = Number(pageSize);
      OutflowInstallments.findAndCountAll({
        offset,
        limit,
        where,
        order,
        include: [
          {
            association: "purchases",
            include: [{ association: "provider" }],
          },
        ],
      })
        .then((outflow) => {
          let data = {};
          data.docs = outflow.rows;

          data.total = outflow.count;
          data.pages = Math.ceil(outflow.count / limit);

          return res.status(200).json(data);
        })
        .catch((e) => {
          return res
            .status(400)
            .json({ error: "Houve um erro inesperado", info: e });
        });
    } else {
      OutflowInstallments.findAll({
        where,
        order,
        include: [
          {
            association: "purchases",
            include: [{ association: "provider" }],
          },
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
  async store(req, res) {
    let {
      accountId,
      installmentValue,
      type,
      note,
      dueDate,
      paymentDate,
    } = req.body;
    const { companyId } = req.params;

    let validation = {};

    let account = await Account.findOne({
      where: { id: accountId, companyId: companyId },
    });
    /* -------------------------------------------------------------------------- */
    /*                       Validando o formato dos valores                      */
    /* -------------------------------------------------------------------------- */

    if (!account) {
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

    if (!account) {
      return res
        .status(400)
        .json({ error: "A conta informada não pertence a sua empresa" });
    }

    /* -------------------------------------------------------------------------- */
    /*                   Armazenando valores fixos em variáveis                   */
    /* -------------------------------------------------------------------------- */

    let installmentNumber = 1;
    let installmentTotal = 1;

    /* -------------------------------------------------------------------------- */
    /*                             Cadastrando parcela                            */
    /* -------------------------------------------------------------------------- */

    await OutflowInstallments.create({
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
    const { id, companyId } = req.params;

    let account = await Account.findOne({
      where: { id: accountId, companyId: companyId },
    });

    const {
      dueDate,
      paymentDate,
      installmentValue,
      accountId,
      type,
      note,
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

    if (account) {
      return res
        .status(400)
        .json({ error: "A conta informada não pertence a sua empresa!" });
    }

    /* -------------------------------------------------------------------------- */
    /*                            Atualizando a parcela                           */
    /* -------------------------------------------------------------------------- */

    OutflowInstallments.update(
      { dueDate, paymentDate, installmentValue, accountId, type, note },
      { where: { id, companyId: companyId } }
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
