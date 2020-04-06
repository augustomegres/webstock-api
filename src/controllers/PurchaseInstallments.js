const User = require("../models/User");
const PurchaseInstallments = require("../models/PurchaseInstallments");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    const { paid, start_date, finish_date, min_value, max_value } = req.query;

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

    var installments = await PurchaseInstallments.findAll({ where });

    return res.status(200).json(installments);
  }
};
