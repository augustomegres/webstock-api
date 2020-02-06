const { Model, DataTypes } = require("sequelize");

class Installment extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        providerId: DataTypes.INTEGER,
        date: DataTypes.INTEGER,
        freight: DataTypes.INTEGER,
        quantity: DataTypes.DECIMAL,
        price: DataTypes.DATE
      },
      {
        sequelize,
        modelName: "purchases"
      }
    );
  }
}

module.exports = Installment;
