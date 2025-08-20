const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path

const Teachers = sequelize.define('teachers', {
    id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  tchid: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
  tchnam: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tchmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tchrole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tchdept: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  techsch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  techcat: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  techdesig: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  pnroid:true
});

module.exports = Teachers;
