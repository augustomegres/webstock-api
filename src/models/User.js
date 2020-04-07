const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        cpf: DataTypes.STRING,
        phone: DataTypes.STRING,
        date_of_birth: DataTypes.DATE,
        passwordHash: DataTypes.STRING,
        recoverPasswordToken: DataTypes.STRING,
        recoverPasswordTokenExpires: DataTypes.DATE,
        planType: DataTypes.INTEGER,
        planExpirationDate: DataTypes.DATE,
        isAdmin: DataTypes.BOOLEAN
      },
      {
        sequelize,
        modelName: "users"
      }
    );
  }
}

module.exports = User;
