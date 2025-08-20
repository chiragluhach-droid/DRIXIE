const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path

const ForwardingRules = sequelize.define('forwardingrules', {
    id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  fromrole: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  torole: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  panroid:true
});

module.exports = ForwardingRules;
