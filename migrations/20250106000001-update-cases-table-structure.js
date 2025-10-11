'use strict';

/**
 * Updates cases table to match the required structure by removing dispute fields
 * and keeping only the core case management fields
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove all dispute-related fields that were added in the previous migration
    const columnsToRemove = [
      'requester_name',
      'requester_email',
      'requester_phone',
      'requester_address',
      'respondent_name',
      'respondent_email',
      'respondent_phone',
      'respondent_address',
      'relationship_between_parties',
      'nature_of_dispute',
      'brief_description_of_dispute',
      'occurrence_date',
      'prior_communication',
      'prior_communication_other',
      'sought_monetary_claim',
      'sought_settlement',
      'sought_other',
      'attachments_json',
    ];

    // Drop columns if they exist
    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('cases', column);
      } catch (error) {
        // Column might not exist, continue
        console.log(`Column ${column} might not exist, skipping...`);
      }
    }

    // Ensure the core fields exist with proper structure
    await queryInterface.changeColumn('cases', 'case_number', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    });

    await queryInterface.changeColumn('cases', 'title', {
      type: Sequelize.STRING(255),
      allowNull: false
    });

    await queryInterface.changeColumn('cases', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.changeColumn('cases', 'case_type', {
      type: Sequelize.ENUM('criminal', 'civil', 'family', 'corporate', 'property', 'other'),
      allowNull: false,
      defaultValue: 'civil'
    });

    await queryInterface.changeColumn('cases', 'status', {
      type: Sequelize.ENUM('open', 'in_progress', 'closed', 'on_hold'),
      allowNull: false,
      defaultValue: 'open'
    });

    await queryInterface.changeColumn('cases', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    });

    await queryInterface.changeColumn('cases', 'court_name', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.changeColumn('cases', 'judge_name', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.changeColumn('cases', 'next_hearing_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('cases', 'fees', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    await queryInterface.changeColumn('cases', 'fees_paid', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    await queryInterface.changeColumn('cases', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('cases', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Add back the dispute fields if rollback is needed
    await queryInterface.addColumn('cases', 'requester_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'requester_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'requester_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'requester_address', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('cases', 'respondent_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'respondent_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'respondent_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'respondent_address', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('cases', 'relationship_between_parties', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'nature_of_dispute', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'brief_description_of_dispute', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'occurrence_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('cases', 'prior_communication', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('cases', 'prior_communication_other', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('cases', 'sought_monetary_claim', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('cases', 'sought_settlement', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.addColumn('cases', 'sought_other', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('cases', 'attachments_json', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
