'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'aadhar_file_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'reset_password_expires'
    });

    await queryInterface.addColumn('users', 'pan_file_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'aadhar_file_path'
    });

    await queryInterface.addColumn('users', 'cancelled_cheque_file_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'pan_file_path'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'aadhar_file_path');
    await queryInterface.removeColumn('users', 'pan_file_path');
    await queryInterface.removeColumn('users', 'cancelled_cheque_file_path');
  }
};

