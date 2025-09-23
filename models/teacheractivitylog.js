'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserActivityLog = sequelize.define('teacher_activity_log', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  userId: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., login, fetch_document, view_audit_log',
  },
  target: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'e.g., document, audit_log, user',
  },
  targetId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID of the record being acted on',
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  long: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latd: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'success',
    comment: 'success or failure',
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Any extra info or error message',
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'teacher_activity_logs',
  timestamps: true,
});

module.exports = UserActivityLog;
