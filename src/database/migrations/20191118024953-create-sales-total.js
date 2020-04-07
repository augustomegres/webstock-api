"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("sales", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      seller: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "sellers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      customer: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "customers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      freight: {
        type: Sequelize.DECIMAL(10, 2),
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
    return queryInterface.dropTable("sales");
  }
};
