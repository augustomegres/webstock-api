const { Model, DataTypes } = require("sequelize");

class ProductSold extends Model {
  static init(sequelize) {
    super.init(
      {
        saleId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        productName: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        unityPrice: DataTypes.DECIMAL,
      },
      {
        sequelize,
        modelName: "product_sold",
      }
    );
  }
}

module.exports = ProductSold;
