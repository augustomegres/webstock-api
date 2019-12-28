"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "users",
      "recoverPasswordTokenExpires",
      Sequelize.DATE
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "recoverPasswordTokenExpires");
  }
};
