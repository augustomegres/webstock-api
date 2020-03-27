const User = require("../models/User");
const PurchaseInstallments = require("../models/PurchaseInstallments");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    let {
      paid,
      min_date_time,
      max_date_time,
      min_value,
      max_value,
      page,
      pageSize,
      dueDate,
      purchaseId
    } = req.query;

    if (!page) {
      page = 1;
    }

    if (!pageSize) {
      pageSize = 15;
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          association: "company"
        }
      ]
    });

    const where = {
      companyId: user.company.id
    };

    /** FILTROS DE DATA DE PAGAMENTOS */
    if (paid == "true") {
      where.paymentDate = {
        [Op.ne]: null
      };
    }

    if (paid == "false") {
      where.paymentDate = {
        [Op.eq]: null
      };
    }

    /** ID DA COMPRA */
    if (purchaseId) {
      where.purchaseId = {
        [Op.eq]: purchaseId
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
          [Op.lte]: new Date(`${max_date_time}`) || max_date
        }
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
        [Op.gte]: value
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
        [Op.lte]: value
      };
    }

    var installments = await PurchaseInstallments.paginate({
      page: page,
      paginate: Number(pageSize),
      where,
      order: searchOrder
    });

    return res.status(200).json(installments);
  },
  async update(req, res) {
    const { userId } = req;
    const { id } = req.params;
    const { paymentDate } = req.body;

    new Date(paymentDate);

    const loggedUser = await User.findByPk(userId, {
      include: [
        {
          association: "company"
        }
      ]
    });

    const installment = await PurchaseInstallments.update(
      {
        paymentDate
      },
      {
        where: {
          id,
          companyId: loggedUser.company.id
        }
      }
    );

    if (!installment) {
      return res.status(400).json({
        error: "Houve um erro ao atualizar as parcelas"
      });
    }

    return res.status(200).json(installment);
  }
};
