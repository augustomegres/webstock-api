"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("installments", {
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
        allowNull: false,
        default: 1,
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      saleId: {
        type: Sequelize.INTEGER,
        references: { model: "sales", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      installmentNumber: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      installmentTotal: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      installmentValue: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      paymentDate: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable("installments");
  }
};