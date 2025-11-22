'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, convert existing string dates to DATE format
    // This will handle dates in DD.MM.YYYY format
    await queryInterface.sequelize.query(`
      UPDATE notices 
      SET date = CASE 
        WHEN date IS NOT NULL AND date != '' AND date REGEXP '^[0-9]{2}\\.[0-9]{2}\\.[0-9]{4}$' THEN
          STR_TO_DATE(date, '%d.%m.%Y')
        WHEN date IS NOT NULL AND date != '' AND date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
          STR_TO_DATE(date, '%Y-%m-%d')
        ELSE NULL
      END
      WHERE date IS NOT NULL AND date != '';
    `);

    // Change column type from STRING to DATE
    await queryInterface.changeColumn('notices', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Date for the notice (stored as DATE)'
    });
  },

  async down(queryInterface, Sequelize) {
    // Convert DATE back to STRING in DD.MM.YYYY format
    await queryInterface.sequelize.query(`
      UPDATE notices 
      SET date = DATE_FORMAT(date, '%d.%m.%Y')
      WHERE date IS NOT NULL;
    `);

    // Change column type back to STRING
    await queryInterface.changeColumn('notices', 'date', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Date in DD.MM.YYYY format for the notice'
    });
  }
};

