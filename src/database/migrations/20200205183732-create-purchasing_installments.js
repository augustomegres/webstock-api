"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("purchase_installments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
      },
      companyId: {
        type: Sequelize.INTEGER,
        references: { model: "companies", key: "id" },
        allowNull: false,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      purchaseId: {
        type: Sequelize.INTEGER,
        references: { model: "purchases", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      accountId: {
        type: Sequelize.INTEGER,
        references: { model: "accounts", key: "id" },
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      installmentNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      installmentTotal: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      installmentValue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable("purchase_installments");
  },
};
