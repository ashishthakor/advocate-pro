'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('chat_messages', 'file_key', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'S3 key for file deletion'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('chat_messages', 'file_key');
  }
};


