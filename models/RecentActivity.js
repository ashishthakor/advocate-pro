const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recent_activities', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('success', 'warning', 'error', 'info'),
      allowNull: false,
      defaultValue: 'info'
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    related_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    related_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'recent_activities',
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
        name: "idx_recent_activities_type",
        using: "BTREE",
        fields: [
          { name: "type" },
        ]
      },
      {
        name: "idx_recent_activities_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_recent_activities_user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "idx_recent_activities_related",
        using: "BTREE",
        fields: [
          { name: "related_id" },
          { name: "related_type" },
        ]
      },
      {
        name: "idx_recent_activities_created_at",
        using: "BTREE",
        fields: [
          { name: "created_at" },
        ]
      }
    ]
  });
};

