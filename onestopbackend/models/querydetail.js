'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path

const Querydetail = sequelize.define('querydetail', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  assignnow: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  queryno: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  queryid: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  createdby: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'resolved',
      'forwardedandpending',
      'inreview',
      'draft'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
  catagoryid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subcaragoryid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue:0
  },
}, {
  timestamps: true,
  pnroid: true
});

module.exports = Querydetail;
