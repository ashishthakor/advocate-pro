'use strict';

/**
 * Adds tracking_id column to cases table
 * Tracking ID is optional and can be added/edited by admin only
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cases', 'tracking_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Optional tracking ID for the case, can be added/edited by admin only'
    });

    // Add index for tracking_id for faster lookups
    await queryInterface.addIndex('cases', ['tracking_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('cases', ['tracking_id']);
    await queryInterface.removeColumn('cases', 'tracking_id');
  }
};
