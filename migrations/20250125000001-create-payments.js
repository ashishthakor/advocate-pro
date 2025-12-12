'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
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
      case_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
          model: 'cases',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      razorpay_order_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      razorpay_payment_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      razorpay_signature: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'INR'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      payment_description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: 'Case Registration Fee'
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON string for additional payment metadata'
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
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['case_id']);
    await queryInterface.addIndex('payments', ['razorpay_order_id']);
    await queryInterface.addIndex('payments', ['razorpay_payment_id']);
    await queryInterface.addIndex('payments', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};

