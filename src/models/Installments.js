const { Model, DataTypes } = require("sequelize");

class Installment extends Model {
  static init(sequelize) {
    super.init(
      {
        sellId: DataTypes.INTEGER,
        installmentNumber: DataTypes.INTEGER,
        installmentTotal: DataTypes.INTEGER,
        installmentValue: DataTypes.DECIMAL,
        dueDate: DataTypes.DATE,
        paid: DataTypes.BOOLEAN,
        paymentDate: DataTypes.DATE
      },
      {
        sequelize,
        modelName: "installments"
      }
    );
  }
}

module.exports = Installment;
