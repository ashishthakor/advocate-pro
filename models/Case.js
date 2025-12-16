const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cases', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    case_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "cases_case_number_unique"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    case_type: {
      type: DataTypes.ENUM('criminal', 'civil', 'family', 'corporate', 'property', 'other'),
      allowNull: false,
      defaultValue: 'civil'
    },
    status: {
      type: DataTypes.ENUM(
        'pending_payment',
        'waiting_for_action',
        'neutrals_needs_to_be_assigned', 
        'consented',
        'closed_no_consent',
        'close_no_settlement',
        'temporary_non_starter',
        'settled',
        'hold',
        'withdrawn'
      ),
      allowNull: false,
      defaultValue: 'waiting_for_action'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    advocate_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    court_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    judge_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    next_hearing_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fees: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    fees_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Dispute-related fields
    requester_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    requester_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    requester_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    requester_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requester_business_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    requester_gst_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    respondent_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    respondent_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    respondent_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    respondent_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    respondent_business_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    respondent_gst_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    relationship_between_parties: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nature_of_dispute: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    brief_description_of_dispute: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    occurrence_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    prior_communication: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    prior_communication_other: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sought_monetary_claim: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null
    },
    sought_settlement: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null
    },
    sought_other: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    attachments_json: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cases',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "cases_case_number_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "case_number" },
        ]
      },
      {
        name: "cases_user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "cases_advocate_id",
        using: "BTREE",
        fields: [
          { name: "advocate_id" },
        ]
      },
      {
        name: "cases_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "cases_case_type",
        using: "BTREE",
        fields: [
          { name: "case_type" },
        ]
      },
    ]
  });
};