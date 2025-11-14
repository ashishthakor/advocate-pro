'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'chat_message_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'chat_messages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Optional link to chat message if uploaded via chat'
    });

    await queryInterface.addIndex('documents', ['chat_message_id'], {
      name: 'idx_documents_chat_message_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('documents', 'idx_documents_chat_message_id');
    await queryInterface.removeColumn('documents', 'chat_message_id');
  }
};


