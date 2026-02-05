'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path
const Subcategory = sequelize.define('querysubcategory', {
    id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  responsetime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isactive:{
    type:DataTypes.BOOLEAN,
    defaultValue:true
  }
}, {
  timestamps: true,
  pnroid:true,
  tableName:'querysubcategories'
});

module.exports = Subcategory;

