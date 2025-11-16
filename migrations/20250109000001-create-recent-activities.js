'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recent_activities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Activity type: case_created, user_registration, advocate_approval, case_assigned, etc.'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Human-readable activity message'
      },
      status: {
        type: Sequelize.ENUM('success', 'warning', 'error', 'info'),
        allowNull: false,
        defaultValue: 'info',
        comment: 'Activity status for UI display'
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who performed the action (optional)'
      },
      related_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        comment: 'ID of related entity (e.g., case_id, user_id)'
      },
      related_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of related entity (e.g., case, user, document)'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional metadata in JSON format'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('recent_activities', ['type']);
    await queryInterface.addIndex('recent_activities', ['status']);
    await queryInterface.addIndex('recent_activities', ['user_id']);
    await queryInterface.addIndex('recent_activities', ['related_id', 'related_type']);
    await queryInterface.addIndex('recent_activities', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recent_activities');
  }
};

