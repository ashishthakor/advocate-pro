'use strict';

/**
 * Adds back the dispute-related fields to cases table to match the required structure
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add back all dispute-related fields
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

  async down(queryInterface, Sequelize) {
    // Remove the dispute fields if rollback is needed
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

    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('cases', column);
      } catch (error) {
        console.log(`Column ${column} might not exist, skipping...`);
      }
    }
  },
};
