"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("providers", {
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
      productIds: {
        type: Sequelize.ARRAY({
          type: Sequelize.INTEGER,
          references: { model: "products", key: "id" },
          allowNull: true,
          default: [],
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        })
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      personType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      companyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rg: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cnpj: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stateRegistration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      municipalRegistration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cep: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      street: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      commercialPhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      privatePhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable("providers");
  }
};
