"use strict";

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          name: "Jose Augusto Megres de Oliveira",
          email: "augustomegres@gmail.com",
          cpf: "137.088.616-04",
          date_of_birth: "1996-08-17",
          phone: "(32)998109306",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Luana Fernanda Teixeira",
          email: "lluanafernandateixeira@hotmmail.com",
          cpf: "599.712.349-98",
          date_of_birth: "1957-03-17",
          phone: "(95)998785158",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "Geraldo Ricardo Fernandes",
          email: "ggeraldoricardofernandes@cpfl.com.br",
          cpf: "837.612.870-11",
          date_of_birth: "1943-02-26",
          phone: "(96)986046460",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "Yasmin Maitê Luna Rodrigues",
          email: "yasminmaitelunarodrigues-84@hotmaill.com",
          cpf: "545.900.604-00",
          date_of_birth: "1949-07-27",
          phone: "(91)37224442",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: "Benedita Lívia Teresinha da Mota",
          email: "beneditaliviateresinhadamota_@vuyu.es",
          cpf: "542.669.915-17",
          date_of_birth: "1954-06-11",
          phone: "(19)989036768",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: "Elisa Emily Agatha Silva",
          email: "eelisaemilyagathasilva@signa.net.br",
          cpf: "738.864.633-70",
          date_of_birth: "1949-03-16",
          phone: "(95)988691046",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 7,
          name: "Emanuelly Laís Moraes",
          email: "emanuellylaismoraes@peopleside.com.br",
          cpf: "432.133.170-63",
          date_of_birth: "1969-12-07",
          phone: "(85)983147477",
          passwordHash:
            "$2a$10$Nti1xkCa4yVOEIdHp3F/MOiGZJL5HQFYwngq/WKkjqruq/B4Y8vNC",
          planType: 0,
          planExpirationDate: new Date().setDate(new Date().getDate() + 7),
          isAdmin: false,
          recoverPasswordToken: null,
          recoverPasswordTokenExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", [
      {
        id: 1,
      },
      {
        id: 2,
      },
      {
        id: 3,
      },
      {
        id: 4,
      },
      {
        id: 5,
      },
      {
        id: 6,
      },
      {
        id: 7,
      },
    ]);
  },
};
