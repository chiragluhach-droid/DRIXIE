'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path
const Studentuser = sequelize.define('studentuser', {
  name: {
    type: DataTypes.STRING,
    allowNull:false
  },
  mobile: { type: DataTypes.STRING,allowNull:false,unique:true },
  email: { type: DataTypes.STRING,allowNull:false,unique:true },
  stdid: { type: DataTypes.STRING,allowNull:false,unique:true },
  sid: { type: DataTypes.UUID,allowNull:false,unique:true ,defaultValue:DataTypes.UUIDV4},
  deviced: { type: DataTypes.STRING,allowNull:true },
  sessiontoken: { type: DataTypes.STRING,allowNull:true },
  lastlogin: { type: DataTypes.DATE,allowNull:true },
  department: { type: DataTypes.STRING,allowNull:true },
  university: { type: DataTypes.STRING,allowNull:true },
  school: { type: DataTypes.STRING,allowNull:false },
  isactive: { type: DataTypes.BOOLEAN,allowNull:false,defaultValue:true },
  isdelete: { type: DataTypes.BOOLEAN,allowNull:false,defaultValue:false },
  sessionstartyear: { type: DataTypes.INTEGER,allowNull:true },
  endyear: { type: DataTypes.INTEGER,allowNull:true },
  course: { type: DataTypes.STRING,allowNull:true }
}, {
  timestamps: true,
  panroid: true
})
module.exports = Studentuser
