const { Model, DataTypes } = require("sequelize");

class Sales extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        date: DataTypes.DATE,
        seller: DataTypes.STRING,
        customer: DataTypes.INTEGER,
        freight: DataTypes.DECIMAL
      },
      {
        sequelize,
        modelName: "sales"
      }
    );
  }
}

module.exports = Sales;
