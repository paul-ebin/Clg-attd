const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    // For students: this could be their reg_no
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  plain_password: {
    type: DataTypes.STRING,
    allowNull: true // Only for teachers, to be visible by admin
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'TEACHER', 'STUDENT'),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;
