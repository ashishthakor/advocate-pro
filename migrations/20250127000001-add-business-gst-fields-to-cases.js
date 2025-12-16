'use strict';

/**
 * Adds business name and GST number fields for both requester (applicant) and respondent
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add business name and GST number for requester (applicant)
    await queryInterface.addColumn('cases', 'requester_business_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    
    await queryInterface.addColumn('cases', 'requester_gst_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    // Add business name and GST number for respondent
    await queryInterface.addColumn('cases', 'respondent_business_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    
    await queryInterface.addColumn('cases', 'respondent_gst_number', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the business and GST fields if rollback is needed
    const columnsToRemove = [
      'requester_business_name',
      'requester_gst_number',
      'respondent_business_name',
      'respondent_gst_number',
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

