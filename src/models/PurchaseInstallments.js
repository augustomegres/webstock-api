const { Model, DataTypes } = require("sequelize");

class Installment extends Model {
  static init(sequelize) {
    super.init(
      {
        purchaseId: DataTypes.INTEGER,
        companyId: DataTypes.INTEGER,
        installmentNumber: DataTypes.INTEGER,
        installmentTotal: DataTypes.INTEGER,
        installmentValue: DataTypes.DECIMAL,
        dueDate: DataTypes.DATE,
        paymentDate: DataTypes.DATE
      },
      {
        sequelize,
        modelName: "purchase_installments"
      }
    );
  }
}

module.exports = Installment;
