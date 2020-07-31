const { Model, DataTypes } = require("sequelize");

class Sales extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        sellerId: DataTypes.STRING,
        customerId: DataTypes.INTEGER,
        freight: DataTypes.DECIMAL,
      },
      {
        sequelize,
        modelName: "sales",
      }
    );
  }
}

module.exports = Sales;
