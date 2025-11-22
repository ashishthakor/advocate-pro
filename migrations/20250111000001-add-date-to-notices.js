'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notices', 'date', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'subject',
      comment: 'Date in DD.MM.YYYY format for the notice'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notices', 'date');
  }
};

