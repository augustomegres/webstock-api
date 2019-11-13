const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        cpf: DataTypes.STRING,
        phone: DataTypes.STRING,
        passwordHash: DataTypes.STRING,
        isAdmin: DataTypes.BOOLEAN
      },
      {
        sequelize,
        modelName: "users"
      }
    );
  }
  //this.hasMany(models.Company, );
}

module.exports = User;