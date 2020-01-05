const { Model, DataTypes } = require("sequelize");

class Account extends Model {
  static init(sequelize) {
    super.init(
      {
        name: DataTypes.STRING,
        value: DataTypes.DECIMAL,
        accountType: DataTypes.STRING,
        accountBank: DataTypes.STRING,
        agencyNumber: DataTypes.STRING,
        accountNumber: DataTypes.STRING,
        ownerId: DataTypes.INTEGER
      },
      {
        sequelize,
        modelName: "accounts"
      }
    );
  }
}

module.exports = Account;
