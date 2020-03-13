"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("accounts", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: "companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      accountType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      accountBank: {
        type: Sequelize.STRING,
        allowNull: true
      },
      agencyNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accountNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable("accounts");
  }
};
