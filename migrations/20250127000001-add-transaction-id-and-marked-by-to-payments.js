'use strict';

/**
 * Adds transaction_id and marked_by fields to payments table
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payments', 'transaction_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Transaction ID or reference number for manual payments'
    });

    await queryInterface.addColumn('payments', 'marked_by', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User ID of admin who manually marked this payment as paid'
    });

    // Add index for marked_by for faster lookups
    await queryInterface.addIndex('payments', ['marked_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('payments', ['marked_by']);
    await queryInterface.removeColumn('payments', 'marked_by');
    await queryInterface.removeColumn('payments', 'transaction_id');
  }
};

