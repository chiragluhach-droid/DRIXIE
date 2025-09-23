const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust this to your connection path

const ForwardHistory = sequelize.define(
  "forwardhistory",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    queryid:{
      type: DataTypes.UUIDV4,
      allowNull: false,
      unique:true
    },
    frtid: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    frtn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frtr: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frtd: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frts: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tid: {
      type: DataTypes.UUIDV4,
      allowNull: false,
    },
    tnm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tdsg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tsch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
    type: DataTypes.ENUM(
      'pending',
      'resolved',
      'forwardedandpending',
      'inreview',
      'draft'
    ),
    allowNull: false,
    defaultValue: 'pending'
  },
    notes: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    panroid: true,
  }
);

module.exports = ForwardHistory;
