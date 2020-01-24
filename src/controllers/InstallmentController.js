const User = require("../models/User");
const Installment = require("../models/Installments");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    const { paid } = req.query;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    if (paid) {
      var installments = await Installment.findAll({
        where: { companyId: user.company.id, paymentDate: { [Op.ne]: null } }
      });
    } else {
      var installments = await Installment.findAll({
        where: { companyId: user.company.id }
      });
    }

    return res.status(200).json(installments);
  }
};
