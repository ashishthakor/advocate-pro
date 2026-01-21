'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('User@123', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: hashedPassword,
        role: 'user',
        is_approved: true,
        phone: '+1234567894',
        address: '100 User Court, Legal City',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Wilson',
        email: 'jane.wilson@email.com',
        password: hashedPassword,
        role: 'user',
        is_approved: true,
        phone: '+1234567895',
        address: '200 Plaintiff Place, Legal City',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Robert Brown',
        email: 'robert.brown@email.com',
        password: hashedPassword,
        role: 'user',
        is_approved: true,
        phone: '+1234567896',
        address: '300 Defendant Drive, Legal City',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      role: 'user'
    });
  }
};
