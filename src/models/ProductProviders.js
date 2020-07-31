const { Model, DataTypes } = require("sequelize");

class ProductProviders extends Model {
  static init(sequelize) {
    super.init(
      {
        productId: DataTypes.INTEGER,
        providerId: DataTypes.INTEGER,
      },
      {
        sequelize,
        modelName: "products_providers",
      }
    );
  }
}

module.exports = ProductProviders;
