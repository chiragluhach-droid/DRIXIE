'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const moment = require('moment-timezone');

const OTPTable = sequelize.define('otptable', {
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
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => moment().tz('Asia/Kolkata').toDate(),
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[0, 1]], // 0: unused, 1: used
    },
  },
}, {
  tableName: 'otptables',
  timestamps: true,
});

module.exports = OTPTable;
