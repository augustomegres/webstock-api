const { Model, DataTypes } = require("sequelize");

class Company extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        cnpj: DataTypes.STRING,
        address: DataTypes.STRING,
        number: DataTypes.STRING,
        street: DataTypes.STRING,
        city: DataTypes.STRING,
        ownerId: DataTypes.INTEGER
      },
      {
        sequelize,
        modelName: "companies"
      }
    );
  }
}

module.exports = Company;
