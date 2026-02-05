const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust this to your connection path


const RefSeFile = sequelize.define('refsefile', {
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
    refid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    queryid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addedby: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tdept: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tschl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isdeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    paranoid: true,   // Enables soft deletes (sets isdeleted to true instead of deleting)
    // tableName: 'refsefiles',
  });
  module.exports=RefSeFile;