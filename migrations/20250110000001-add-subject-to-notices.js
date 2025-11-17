'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notices', 'subject', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'respondent_pincode'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('notices', 'subject');
  }
};

