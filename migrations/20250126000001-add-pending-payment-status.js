'use strict';

/**
 * Adds 'pending_payment' status to case status enum
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, temporarily change the column to VARCHAR to allow any value
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'waiting_for_action'
    });

    // Now update the enum with new status
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.ENUM(
        'pending_payment',
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
      defaultValue: 'waiting_for_action'
    });

    // Revert to previous status enum (without pending_payment)
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
  }
};

