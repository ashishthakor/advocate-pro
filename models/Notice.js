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

