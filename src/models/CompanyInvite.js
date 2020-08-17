const { Model, DataTypes } = require("sequelize");

class CompanyInvite extends Model {
  static init(sequelize) {
    super.init(
      {
        guestId: DataTypes.STRING,
        companyId: DataTypes.INTEGER,
        status: DataTypes.STRING,
      },
      {
        sequelize,
        modelName: "invites_table",
      }
    );
  }
}

module.exports = CompanyInvite;
