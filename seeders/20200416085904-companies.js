"use strict";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "companies",
      [
        {
          id: 1,
          ownerId: 1,
          name: "Webstock",
          street: "Imê Farage",
          address: "Rua Amazonas, 115",
          city: "Cataguases - MG",
          cnpj: "30.623.195/0001-97",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          ownerId: 2,
          name: "Joaquim e Maria Restaurante Ltda",
          street: "Baronesa",
          address: "Estrada Bem-te-vi, 775",
          city: "São Paulo - SP",
          cnpj: "06.494.817/0001-40",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          ownerId: 3,
          name: "Hugo e Julia Entulhos Ltda",
          street: "Imê Farage",
          address: "Rua Professor Henrique Jorge Guedes, 111",
          city: "São José dos Campos - SP",
          cnpj: "32.444.414/0001-04",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("companies", [
      {
        id: 1,
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
    ]);
  },
};
