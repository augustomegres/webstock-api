const { Model, DataTypes } = require("sequelize");

class Purchase extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        providerId: DataTypes.INTEGER,
        productId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        freight: DataTypes.INTEGER,
        quantity: DataTypes.DECIMAL,
      },
      {
        sequelize,
        modelName: "purchases",
      }
    );
  }
}

module.exports = Purchase;
