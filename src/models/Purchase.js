const { Model, DataTypes } = require("sequelize");

class Purchase extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        buyerId: DataTypes.INTEGER,
        providerId: DataTypes.INTEGER,
        freight: DataTypes.INTEGER,
        discount: DataTypes.DECIMAL,
        discountType: DataTypes.STRING,
      },
      {
        sequelize,
        modelName: "purchases",
      }
    );
  }
}

module.exports = Purchase;
