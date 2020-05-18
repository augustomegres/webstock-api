const { Model, DataTypes } = require("sequelize");

class InflowInstallments extends Model {
  static init(sequelize) {
    super.init(
      {
        saleId: DataTypes.INTEGER,
        companyId: DataTypes.INTEGER,
        accountId: DataTypes.INTEGER,
        installmentNumber: DataTypes.INTEGER,
        installmentTotal: DataTypes.INTEGER,
        installmentValue: DataTypes.DECIMAL,
        dueDate: DataTypes.DATE,
        paymentDate: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: "inflow-installments",
      }
    );
  }
}

module.exports = InflowInstallments;
