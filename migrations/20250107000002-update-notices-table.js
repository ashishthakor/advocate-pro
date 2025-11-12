'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename pdf_path to pdf_filename
    await queryInterface.renameColumn('notices', 'pdf_path', 'pdf_filename');
    
    // Add email_sent_count column
    await queryInterface.addColumn('notices', 'email_sent_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert changes
    await queryInterface.renameColumn('notices', 'pdf_filename', 'pdf_path');
    await queryInterface.removeColumn('notices', 'email_sent_count');
  }
};

