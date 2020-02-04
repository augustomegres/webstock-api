"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("products", {
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
      providersIds: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        references: { model: "providers", key: "id" },
        allowNull: true,
        default: [],
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        default: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      quantity: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      minimum: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        default: 0
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
    return queryInterface.dropTable("products");
  }
};
