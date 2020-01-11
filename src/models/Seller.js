const { Model, DataTypes } = require("sequelize");

class Seller extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        companyId: DataTypes.INTEGER,
        enabled: DataTypes.BOOLEAN
      },
      {
        sequelize,
        modelName: "sellers"
      }
    );
  }
}

module.exports = Seller;
