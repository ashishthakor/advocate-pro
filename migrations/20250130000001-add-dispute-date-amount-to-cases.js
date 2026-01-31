'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cases', 'dispute_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'dispute_amount', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('cases', 'dispute_amount');
    await queryInterface.removeColumn('cases', 'dispute_date');
  }
};
