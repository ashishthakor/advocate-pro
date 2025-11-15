const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('documents', {
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
    uploaded_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    s3_key: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('evidence', 'contract', 'correspondence', 'court_document', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    download_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    chat_message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'chat_messages',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'documents',
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
        name: "idx_documents_case_id",
        using: "BTREE",
        fields: [
          { name: "case_id" },
        ]
      },
      {
        name: "idx_documents_uploaded_by",
        using: "BTREE",
        fields: [
          { name: "uploaded_by" },
        ]
      },
      {
        name: "idx_documents_file_type",
        using: "BTREE",
        fields: [
          { name: "file_type" },
        ]
      },
      {
        name: "idx_documents_category",
        using: "BTREE",
        fields: [
          { name: "category" },
        ]
      },
      {
        name: "idx_documents_s3_key",
        using: "BTREE",
        fields: [
          { name: "s3_key" },
        ]
      }
    ]
  });
};
