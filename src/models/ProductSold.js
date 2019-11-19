const { Model, DataTypes } = require("sequelize");

class ProductSold extends Model {
  static init(sequelize) {
    super.init(
      {
        sellId: DataTypes.INTEGER,
        product: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        unityPrice: DataTypes.DECIMAL
      },
      {
        sequelize,
        modelName: "productSold"
      }
    );
  }
}

module.exports = ProductSold;
