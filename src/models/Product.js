const { Model, DataTypes } = require("sequelize");

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        sku: DataTypes.STRING,
        type: DataTypes.STRING,
        price: DataTypes.DECIMAL,
        quantity: DataTypes.INTEGER
      },
      {
        sequelize,
        modelName: "products"
      }
    );
  }
}

module.exports = Product;
