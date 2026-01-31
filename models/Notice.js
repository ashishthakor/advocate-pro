const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notices', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    case_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'cases',
        key: 'id'
      }
    },
    respondent_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    respondent_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    respondent_pincode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date for the notice (stored as DATE)'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pdf_filename: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_sent_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    recipient_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notice_stage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Stage of the notice (e.g., Notice-1, Notice-2, etc.). Auto-incremented but editable.'
    },
    tracking_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Optional tracking ID for the sent notice'
    },
    uploaded_file_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'S3 path for uploaded notice files (PDF/DOC format)'
    },
    updated_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID who created/updated/deleted the notice'
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'notices',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deleted_at',
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
        name: "notices_case_id",
        using: "BTREE",
        fields: [
          { name: "case_id" },
        ]
      },
    ]
  });
};

