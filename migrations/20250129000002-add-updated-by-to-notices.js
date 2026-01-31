'use strict';

/**
 * Adds updated_by column to notices table
 * updated_by: Tracks which user created/updated/deleted the notice
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notices', 'updated_by', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User ID who created/updated/deleted the notice'
    });

    // Add index for updated_by for faster lookups
    await queryInterface.addIndex('notices', ['updated_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('notices', ['updated_by']);
    await queryInterface.removeColumn('notices', 'updated_by');
  }
};
