'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      case_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'cases',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      respondent_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      respondent_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      respondent_pincode: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      pdf_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      email_sent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      email_sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      recipient_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      deleted_at: {
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
    await queryInterface.addIndex('notices', ['case_id']);
    await queryInterface.addIndex('notices', ['deleted_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notices');
  }
};

