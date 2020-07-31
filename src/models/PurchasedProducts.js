const { Model, DataTypes } = require("sequelize");

class PurchasedProducts extends Model {
  static init(sequelize) {
    super.init(
      {
        purchaseId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        productName: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        unityPrice: DataTypes.DECIMAL,
      },
      {
        sequelize,
        modelName: "purchased_products",
      }
    );
  }
}

module.exports = PurchasedProducts;
