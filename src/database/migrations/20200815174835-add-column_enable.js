"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("companies", "enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: "lastSeen",
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn("companies", "enabled");
  },
};
