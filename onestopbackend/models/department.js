
'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('department', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isdeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'departments',
  timestamps: true,
});

module.exports = Department;
