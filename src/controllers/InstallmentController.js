const User = require("../models/User");
const Installments = require("../models/Installments");
const { Op } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { userId } = req;
    const { sellId } = req.params;

    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    const installments = await Installments.findAll({
      where: { saleId: sellId, companyId: loggedUser.company.id }
    });

    return res.status(200).json(installments);
  },
  async index(req, res) {
    const { userId } = req;
    const {
      paid,
      start_date,
      finish_date,
      min_value,
      max_value,
      status
    } = req.query;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    const where = { companyId: user.company.id };

    if (paid == "true") {
      where.paymentDate = { [Op.ne]: null };
    }

    if (paid == "false") {
      where.paymentDate = { [Op.eq]: null };
    }

    //Insere a data de início dos dados
    if (start_date) {
      let start = new Date(start_date);

      start = `${start.getFullYear()}/${start.getMonth() +
        1}/${start.getDate()} 00:00:00.000`;

      where.paymentDate = { ...where.paymentDate, [Op.gte]: new Date(start) };
    }

    //Insere a data fim dos dados
    if (finish_date) {
      let finish = new Date(finish_date);

      finish = `${finish.getFullYear()}/${finish.getMonth() +
        1}/${finish.getDate()} 23:59:59.999`;

      where.paymentDate = { ...where.paymentDate, [Op.lte]: new Date(finish) };
    }

    //Insere o valor mínimo dos dados
    if (min_value) {
      let value = Number(min_value);
      if (isNaN(value)) {
        value = 0;
      }

      where.installmentValue = { ...where.installmentValue, [Op.gte]: value };
    }

    //Insere o valor máximo dos dados
    if (max_value) {
      let value = Number(max_value);
      if (isNaN(value)) {
        value = 9999999999999;
      }

      where.installmentValue = { ...where.installmentValue, [Op.lte]: value };
    }

    var installments = await Installments.findAll({ where });

    return res.status(200).json(installments);
  },
  async update(req, res) {
    const { userId } = req;
    const { id } = req.params;
    const { paymentDate } = req.body;

    new Date(paymentDate);

    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    const installment = await Installments.update(
      { paymentDate },
      {
        where: { id, companyId: loggedUser.company.id }
      }
    );

    if (!installment) {
      return res
        .status(400)
        .json({ error: "Houve um erro ao atualizar as parcelas" });
    }

    return res.status(200).json(installment);
  }
};
