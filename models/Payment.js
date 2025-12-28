const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('payments', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    case_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'cases',
        key: 'id'
      }
    },
    razorpay_order_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "payments_razorpay_order_id_unique"
    },
    razorpay_payment_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "payments_razorpay_payment_id_unique"
    },
    razorpay_signature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    payment_description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Case Registration Fee'
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Transaction ID or reference number for manual payments'
    },
    marked_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User ID of admin who manually marked this payment as paid'
    }
  }, {
    sequelize,
    tableName: 'payments',
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
        name: "payments_razorpay_order_id_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "razorpay_order_id" },
        ]
      },
      {
        name: "payments_razorpay_payment_id_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "razorpay_payment_id" },
        ]
      },
      {
        name: "payments_user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "payments_case_id",
        using: "BTREE",
        fields: [
          { name: "case_id" },
        ]
      },
      {
        name: "payments_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
};

