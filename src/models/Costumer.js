const { Model, DataTypes } = require("sequelize");

class Costumer extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        cpf: DataTypes.STRING,
        rg: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        city: DataTypes.STRING,
        address: DataTypes.STRING,
        number: DataTypes.STRING,
        street: DataTypes.STRING
      },
      {
        sequelize,
        modelName: "costumers"
      }
    );
  }
}

module.exports = Costumer;
