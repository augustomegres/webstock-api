"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("product_category", "description", {
      type: Sequelize.TEXT,
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("product_category", "description");
  },
};
