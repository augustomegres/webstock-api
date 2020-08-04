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
        discount: DataTypes.DECIMAL,
        discountType: DataTypes.STRING,
      },
      {
        sequelize,
        modelName: "sales",
      }
    );
  }
}

module.exports = Sales;
