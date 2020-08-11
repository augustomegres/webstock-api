const Product = require("../models/Product");
const OutflowInstallments = require("../models/OutflowInstallments");
const InflowInstallments = require("../models/InflowInstallments");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

module.exports = {
  async show(req, res) {
    const { user } = req;

    /* -------------------------------------------------------------------------- */
    /*                        NOTIFICAÇÃO DE ESTOQUE BAIXO                        */
    /* -------------------------------------------------------------------------- */

    let product = await Product.count({
      where: {
        quantity: { [Op.lt]: Sequelize.col("minimum") },
        companyId: user.company.id,
        enabled: true,
      },
    });

    lowStock = {
      quantity: product,
      description: "Produtos com estoque abaixo do mínimo",
    };

    /* -------------------------------------------------------------------------- */
    /*                     NOTIFICAÇÃO DE PAGAMENTO COM ATRASO                    */
    /* -------------------------------------------------------------------------- */
    let outflow = await OutflowInstallments.count({
      where: {
        dueDate: { [Op.lt]: new Date().setHours(0, 0, 0, 0) },
        paymentDate: { [Op.eq]: null },
        companyId: user.company.id,
      },
    });
    overduePayment = {
      quantity: outflow,
      description: "Quantidade de saídas vencidas",
    };

    /* -------------------------------------------------------------------------- */
    /*                    NOTIFICAÇÃO DE RECEBIMENTO EM ATRASO                    */
    /* -------------------------------------------------------------------------- */

    let inflow = await InflowInstallments.count({
      where: {
        dueDate: { [Op.lt]: new Date().setHours(0, 0, 0, 0) },
        paymentDate: { [Op.eq]: null },
        companyId: user.company.id,
      },
    });

    overdueReceive = {
      quantity: inflow,
      description: "Quantidade de entradas vencidas",
    };

    return res.status(200).json({
      lowStock,
      overduePayment,
      overdueReceive,
    });
  },
};
