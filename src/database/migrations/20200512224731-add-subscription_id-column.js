"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "subscription_id", {
      type: Sequelize.STRING,
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("users", "subscription_id");
  },
};
