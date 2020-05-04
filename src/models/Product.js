const { Model, DataTypes } = require("sequelize");

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        categoryId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        sku: DataTypes.STRING,
        price: DataTypes.DECIMAL,
        quantity: DataTypes.DECIMAL,
        minimum: DataTypes.DECIMAL,
        enabled: DataTypes.BOOLEAN,
      },
      {
        sequelize,
        modelName: "products",
      }
    );
  }
}

module.exports = Product;
