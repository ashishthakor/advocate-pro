'use strict';

/**
 * Updates case status enum to include new status values
 * Sets all existing cases to 'waiting_for_action' status
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, temporarily change the column to VARCHAR to allow any value
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'waiting_for_action'
    });

    // Update all existing cases to 'waiting_for_action' status
    await queryInterface.sequelize.query(
      `UPDATE cases SET status = 'waiting_for_action'`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Now update the enum with new values
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.ENUM(
        'waiting_for_action',
        'neutrals_needs_to_be_assigned', 
        'consented',
        'closed_no_consent',
        'close_no_settlement',
        'temporary_non_starter',
        'settled',
        'hold',
        'withdrawn'
      ),
      allowNull: false,
      defaultValue: 'waiting_for_action'
    });
  },

  async down(queryInterface, Sequelize) {
    // Temporarily change to VARCHAR
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'open'
    });

    // Update all cases back to 'open' status
    await queryInterface.sequelize.query(
      `UPDATE cases SET status = 'open'`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Revert to original status enum
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.ENUM('open', 'in_progress', 'closed', 'on_hold'),
      allowNull: false,
      defaultValue: 'open'
    });
  }
};
