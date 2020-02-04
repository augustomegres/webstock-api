const { Model, DataTypes } = require("sequelize");

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        providersIds: DataTypes.ARRAY(DataTypes.INTEGER),
        sku: DataTypes.STRING,
        type: DataTypes.STRING,
        price: DataTypes.DECIMAL,
        quantity: DataTypes.DECIMAL,
        minimum: DataTypes.DECIMAL,
        enabled: DataTypes.BOOLEAN
      },
      {
        sequelize,
        modelName: "products"
      }
    );
  }
}

module.exports = Product;
