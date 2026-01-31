'use strict';

/**
 * Adds notice_stage, tracking_id, and uploaded_file_path columns to notices table
 * notice_stage: Auto-incremented stage like "Notice-1", "Notice-2", etc. (editable)
 * tracking_id: Optional tracking ID for sent notices
 * uploaded_file_path: S3 path for uploaded files (PDF/DOC)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notices', 'notice_stage', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Stage of the notice (e.g., Notice-1, Notice-2, etc.). Auto-incremented but editable.'
    });

    await queryInterface.addColumn('notices', 'tracking_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Optional tracking ID for the sent notice'
    });

    await queryInterface.addColumn('notices', 'uploaded_file_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'S3 path for uploaded notice files (PDF/DOC format)'
    });

    // Add index for notice_stage for faster lookups
    await queryInterface.addIndex('notices', ['notice_stage']);
    await queryInterface.addIndex('notices', ['tracking_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('notices', ['tracking_id']);
    await queryInterface.removeIndex('notices', ['notice_stage']);
    await queryInterface.removeColumn('notices', 'uploaded_file_path');
    await queryInterface.removeColumn('notices', 'tracking_id');
    await queryInterface.removeColumn('notices', 'notice_stage');
  }
};
