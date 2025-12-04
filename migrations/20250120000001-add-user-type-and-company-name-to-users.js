'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'user_type', {
      type: Sequelize.ENUM('individual', 'corporate'),
      allowNull: true,
      defaultValue: 'individual',
      after: 'role'
    });

    await queryInterface.addColumn('users', 'company_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'user_type'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'company_name');
    await queryInterface.removeColumn('users', 'user_type');
    // Note: ENUM removal might need manual handling depending on database
  }
};



