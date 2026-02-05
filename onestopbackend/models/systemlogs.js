'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemLog = sequelize.define('system_log', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., create_file, transfer_file, delete_file',
  },
  functionName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of function/controller/middleware where the log originated',
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if any',
  },
  params: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Any payload or query sent with the request',
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'system_logs',
  timestamps: false,
});

module.exports = SystemLog;
