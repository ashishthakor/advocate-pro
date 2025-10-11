const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'legal_case_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Initialize models
const initModels = () => {
  const models = require('../models/init-models');
  return models;
};

module.exports = {
  sequelize,
  testConnection,
  initModels
};
