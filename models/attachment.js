const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path


  const Attachment = sequelize.define('attachment', {
    id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isTeacher: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    panroid:true,
    tableName: 'attachments',
  });
  module.exports=Attachment;