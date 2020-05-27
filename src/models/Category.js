const { Model, DataTypes } = require("sequelize");

class Category extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        enabled: DataTypes.BOOLEAN,
      },
      {
        sequelize,
        modelName: "product_category",
      }
    );
  }
}

module.exports = Category;
