const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path

const Comment = sequelize.define('comment', {
    id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    dept: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    school: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     queryid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    timestamps: true,
    panroid:true,
     tableName: 'comments',
  });
  module.exports=Comment;