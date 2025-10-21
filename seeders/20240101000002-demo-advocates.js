'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Advocate@123', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        name: 'Sarah Smith',
        email: 'sarah.smith@legal.com',
        password: hashedPassword,
        role: 'advocate',
        is_approved: true,
        phone: '+1234567891',
        address: '456 Advocate Avenue, Legal City',
        specialization: 'Criminal Law',
        experience_years: 8,
        bar_number: 'BAR001',
        license_number: 'LIC001',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@legal.com',
        password: hashedPassword,
        role: 'advocate',
        is_approved: true,
        phone: '+1234567892',
        address: '789 Legal Lane, Legal City',
        specialization: 'Civil Law',
        experience_years: 12,
        bar_number: 'BAR002',
        license_number: 'LIC002',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Lisa Davis',
        email: 'lisa.davis@legal.com',
        password: hashedPassword,
        role: 'advocate',
        is_approved: true,
        phone: '+1234567893',
        address: '321 Court Street, Legal City',
        specialization: 'Family Law',
        experience_years: 6,
        bar_number: 'BAR003',
        license_number: 'LIC003',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'advocate'
    });
  }
};
