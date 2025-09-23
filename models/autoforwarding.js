// models/autoforwarding.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // adjust path based on your setup

const Autoforwarding = sequelize.define("autoforwarding", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  catid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subcatid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deptid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  auforwardingt:{
    type: DataTypes.UUIDV4,
    allowNull: true,
  },
  assignteacher: {
    type: DataTypes.UUIDV4,
    allowNull: false,
  },
}, {
  tableName: "autoforwardings",
  timestamps: true, // adds createdAt & updatedAt
  paranoid:true
});

export default Autoforwarding;
