'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path

const Comment = sequelize.define('querycategory', {
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    responsetime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    timestamps: true,
    panroid:true,
     tableName: 'querycategories',
  });
  module.exports=Comment;