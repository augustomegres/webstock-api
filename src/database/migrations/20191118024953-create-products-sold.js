"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("productSold", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
      },
      sellId: {
        type: Sequelize.INTEGER,
        references: { model: "sales", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      product: {
        type: Sequelize.INTEGER,
        references: { model: "products", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unityPrice: {
        //PREÇO UNITÁRIO
        type: Sequelize.INTEGER,
        allowNull: false
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
    return queryInterface.dropTable("productSold");
  }
};
