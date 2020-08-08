const { Model, DataTypes } = require("sequelize");

class OutflowInstallments extends Model {
  static init(sequelize) {
    super.init(
      {
        purchaseId: DataTypes.INTEGER,
        companyId: DataTypes.INTEGER,
        accountId: DataTypes.INTEGER,
        installmentNumber: DataTypes.INTEGER,
        installmentTotal: DataTypes.INTEGER,
        installmentValue: DataTypes.DECIMAL,
        type: DataTypes.STRING,
        note: DataTypes.TEXT,
        dueDate: DataTypes.DATE,
        paymentDate: DataTypes.DATE,
      },
      {
        sequelize,
        modelName: "outflow_installments",
      }
    );
  }
}

module.exports = OutflowInstallments;
