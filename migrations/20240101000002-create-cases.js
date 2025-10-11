'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      case_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      case_type: {
        type: Sequelize.ENUM('criminal', 'civil', 'family', 'corporate', 'property', 'other'),
        allowNull: false,
        defaultValue: 'civil'
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'closed', 'on_hold'),
        allowNull: false,
        defaultValue: 'open'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      advocate_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      court_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      judge_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      next_hearing_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fees: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      fees_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('cases', ['user_id']);
    await queryInterface.addIndex('cases', ['advocate_id']);
    await queryInterface.addIndex('cases', ['status']);
    await queryInterface.addIndex('cases', ['priority']);
    await queryInterface.addIndex('cases', ['case_type']);
    await queryInterface.addIndex('cases', ['case_number']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cases');
  }
};
