const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Department = require('./Department');

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Department,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'classes',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  timestamps: true,
  tableName: 'teachers'
});

module.exports = Teacher;
