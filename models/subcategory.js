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
  timestamps: trrue,
  pnroid:true
});

module.exports = Subcategory;

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class subcategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  subcategory.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    responsetime: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'querysubcategory',
  });
  return subcategory;
};