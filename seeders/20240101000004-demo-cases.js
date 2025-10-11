'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get user and advocate IDs (assuming they exist from previous seeders)
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role = "user" ORDER BY id LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const advocates = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role = "advocate" ORDER BY id LIMIT 3',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0 || advocates.length === 0) {
      console.log('No users or advocates found. Skipping case seeding.');
      return;
    }

    await queryInterface.bulkInsert('cases', [
      {
        case_number: 'CASE-2024-001',
        title: 'Property Dispute Case',
        description: 'Dispute over property boundaries and ownership rights between neighbors.',
        case_type: 'property',
        status: 'in_progress',
        priority: 'high',
        user_id: users[0].id,
        advocate_id: advocates[0].id,
        court_name: 'Superior Court of Legal City',
        judge_name: 'Hon. Judge Williams',
        next_hearing_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        fees: 5000.00,
        fees_paid: 1500.00,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        case_number: 'CASE-2024-002',
        title: 'Criminal Defense',
        description: 'Defense case for client charged with theft.',
        case_type: 'criminal',
        status: 'open',
        priority: 'urgent',
        user_id: users[1].id,
        advocate_id: advocates[1].id,
        court_name: 'Criminal Court of Legal City',
        judge_name: 'Hon. Judge Martinez',
        next_hearing_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        fees: 8000.00,
        fees_paid: 2000.00,
        start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        case_number: 'CASE-2024-003',
        title: 'Family Law Matter',
        description: 'Divorce proceedings and child custody arrangements.',
        case_type: 'family',
        status: 'closed',
        priority: 'medium',
        user_id: users[2].id,
        advocate_id: advocates[2].id,
        court_name: 'Family Court of Legal City',
        judge_name: 'Hon. Judge Thompson',
        next_hearing_date: null,
        fees: 3000.00,
        fees_paid: 3000.00,
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cases', {
      case_number: ['CASE-2024-001', 'CASE-2024-002', 'CASE-2024-003']
    });
  }
};
