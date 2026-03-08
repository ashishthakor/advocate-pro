'use strict';

/**
 * Replace 'pending_payment' with notice_1, notice_2, notice_3 in case status enum.
 * Migrates any existing pending_payment cases to waiting_for_action.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Temporarily change the column to VARCHAR to allow value changes
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'waiting_for_action'
    });

    // Migrate pending_payment -> waiting_for_action
    await queryInterface.sequelize.query(
      `UPDATE cases SET status = 'waiting_for_action' WHERE status = 'pending_payment'`
    );

    // Apply new enum with notice_1, notice_2, notice_3 and without pending_payment
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.ENUM(
        'notice_1',
        'notice_2',
        'notice_3',
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
    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'waiting_for_action'
    });

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
  }
};
