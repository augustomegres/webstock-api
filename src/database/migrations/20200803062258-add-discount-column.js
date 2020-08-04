"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("sales", "discount", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        after: "freight",
      });
      await queryInterface.addColumn("sales", "discountType", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "%",
        after: "discount",
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: async (queryInterface) => {
    try {
      await queryInterface.removeColumn("sales", "discount");
      await queryInterface.removeColumn("sales", "discountType");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
