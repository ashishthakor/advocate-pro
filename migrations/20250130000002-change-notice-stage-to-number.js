'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if notice_stage column exists (from old migration)
    const tableDescription = await queryInterface.describeTable('notices');
    const hasNoticeStage = tableDescription.notice_stage;

    if (hasNoticeStage) {
      // If notice_stage exists, convert it to notice_number
      // Remove the old index if it exists
      try {
        await queryInterface.removeIndex('notices', 'notices_case_id_stage_idx');
      } catch (error) {
        console.log('Index might not exist, continuing...');
      }

      // Convert existing ENUM values to numbers
      await queryInterface.sequelize.query(`
        UPDATE notices 
        SET notice_stage = CASE
          WHEN notice_stage = 'notice_1' THEN '1'
          WHEN notice_stage = 'notice_2' THEN '2'
          WHEN notice_stage = 'notice_3' THEN '3'
          ELSE '1'
        END
        WHERE deleted_at IS NULL
      `);

      // For notices beyond the 3rd, assign sequential numbers based on creation order
      // Use temporary table to avoid MySQL subquery limitation
      await queryInterface.sequelize.query(`
        CREATE TEMPORARY TABLE temp_notice_stage_numbers AS
        SELECT 
          n1.id,
          COUNT(*) as notice_num
        FROM notices n1
        INNER JOIN notices n2 ON n2.case_id = n1.case_id 
          AND n2.id <= n1.id 
          AND n2.deleted_at IS NULL
        WHERE n1.deleted_at IS NULL
        GROUP BY n1.id
      `);

      // Update notice_stage using the temporary table
      await queryInterface.sequelize.query(`
        UPDATE notices n
        INNER JOIN temp_notice_stage_numbers t ON n.id = t.id
        SET n.notice_stage = CAST(t.notice_num AS CHAR)
      `);

      // Drop temporary table
      await queryInterface.sequelize.query(`DROP TEMPORARY TABLE IF EXISTS temp_notice_stage_numbers`);

      // Change column type from ENUM to INTEGER
      await queryInterface.changeColumn('notices', 'notice_stage', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Sequential notice number for the case (1, 2, 3, 4...)'
      });

      // Rename column from notice_stage to notice_number
      await queryInterface.renameColumn('notices', 'notice_stage', 'notice_number');

      // Drop the old ENUM type if it exists (MySQL)
      try {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS `enum_notices_notice_stage`');
      } catch (error) {
        console.log('ENUM type might not exist or might be named differently');
      }
    } else {
      // If notice_stage doesn't exist, directly add notice_number
      // Add the notice_number column first with default value
      await queryInterface.addColumn('notices', 'notice_number', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Sequential notice number for the case (1, 2, 3, 4...)'
      });

      // Update notice_number using a temporary table to avoid MySQL subquery limitation
      // Create temporary table with row numbers
      await queryInterface.sequelize.query(`
        CREATE TEMPORARY TABLE temp_notice_numbers AS
        SELECT 
          n1.id,
          COUNT(*) as notice_num
        FROM notices n1
        INNER JOIN notices n2 ON n2.case_id = n1.case_id 
          AND n2.id <= n1.id 
          AND n2.deleted_at IS NULL
        WHERE n1.deleted_at IS NULL
        GROUP BY n1.id
      `);

      // Update notices using the temporary table
      await queryInterface.sequelize.query(`
        UPDATE notices n
        INNER JOIN temp_notice_numbers t ON n.id = t.id
        SET n.notice_number = t.notice_num
      `);

      // Drop temporary table
      await queryInterface.sequelize.query(`DROP TEMPORARY TABLE IF EXISTS temp_notice_numbers`);
    }

    // Add index on case_id and notice_number for better query performance
    // Check if index already exists
    try {
      await queryInterface.addIndex('notices', ['case_id', 'notice_number'], {
        name: 'notices_case_id_number_idx'
      });
    } catch (error) {
      console.log('Index might already exist, continuing...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove new index
    try {
      await queryInterface.removeIndex('notices', 'notices_case_id_number_idx');
    } catch (error) {
      console.log('Index might not exist');
    }

    // Rename column back to notice_stage
    await queryInterface.renameColumn('notices', 'notice_number', 'notice_stage');

    // Convert numbers back to ENUM values (limit to 3)
    await queryInterface.sequelize.query(`
      UPDATE notices 
      SET notice_stage = CASE
        WHEN notice_stage = '1' THEN 'notice_1'
        WHEN notice_stage = '2' THEN 'notice_2'
        WHEN CAST(notice_stage AS UNSIGNED) >= 3 THEN 'notice_3'
        ELSE 'notice_1'
      END
      WHERE deleted_at IS NULL
    `);

    // Change column type back to ENUM
    await queryInterface.changeColumn('notices', 'notice_stage', {
      type: Sequelize.ENUM('notice_1', 'notice_2', 'notice_3'),
      allowNull: false,
      defaultValue: 'notice_1',
      comment: 'Stage of the notice: Notice 1, Notice 2, or Notice 3'
    });

    // Add old index back
    await queryInterface.addIndex('notices', ['case_id', 'notice_stage'], {
      name: 'notices_case_id_stage_idx'
    });
  }
};
