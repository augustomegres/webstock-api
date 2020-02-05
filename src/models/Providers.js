const { Model, DataTypes } = require("sequelize");

class Provider extends Model {
  static init(sequelize) {
    super.init(
      {
        companyId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        personType: DataTypes.STRING,
        companyName: DataTypes.STRING,
        cpf: DataTypes.STRING,
        rg: DataTypes.STRING,
        cnpj: DataTypes.STRING,
        stateRegistration: DataTypes.STRING,
        municipalRegistration: DataTypes.STRING,
        cep: DataTypes.STRING,
        address: DataTypes.STRING,
        number: DataTypes.STRING,
        street: DataTypes.STRING,
        city: DataTypes.STRING,
        commercialPhone: DataTypes.STRING,
        privatePhone: DataTypes.STRING,
        email: DataTypes.STRING
      },
      {
        sequelize,
        modelName: "providers"
      }
    );
  }
}

module.exports = Provider;
