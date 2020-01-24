"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("installments", "companyId", {
      type: Sequelize.INTEGER,
      references: { model: "companies", key: "id" },
      allowNull: false,
      default: 1,
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn("installments", "companyId");
  }
};
