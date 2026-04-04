const sequelize = require('../config/database');

const User = require('./User');
const Department = require('./Department');
const Class = require('./Class');
const Teacher = require('./Teacher');
const Student = require('./Student');
const Attendance = require('./Attendance');
const Notification = require('./Notification');

// --- Define Associations ---

// Department & Class (1:N)
Department.hasMany(Class, { foreignKey: 'department_id', onDelete: 'CASCADE' });
Class.belongsTo(Department, { foreignKey: 'department_id' });

// User & Teacher (1:1)
User.hasOne(Teacher, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Teacher.belongsTo(User, { foreignKey: 'user_id' });

// Department & Teacher (1:N)
Department.hasMany(Teacher, { foreignKey: 'department_id', onDelete: 'CASCADE' });
Teacher.belongsTo(Department, { foreignKey: 'department_id' });

// User & Student (1:1)
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id' });

// Class & Student (1:N)
Class.hasMany(Student, { foreignKey: 'class_id', onDelete: 'CASCADE' });
Student.belongsTo(Class, { foreignKey: 'class_id' });

// Department & Student (1:N)
Department.hasMany(Student, { foreignKey: 'department_id', onDelete: 'CASCADE' });
Student.belongsTo(Department, { foreignKey: 'department_id' });

// Student & Attendance (1:N)
Student.hasMany(Attendance, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Attendance.belongsTo(Student, { foreignKey: 'student_id' });

// Class & Attendance (1:N)
Class.hasMany(Attendance, { foreignKey: 'class_id', onDelete: 'CASCADE' });
Attendance.belongsTo(Class, { foreignKey: 'class_id' });

// Student & Notification (1:N)
Student.hasMany(Notification, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Notification.belongsTo(Student, { foreignKey: 'student_id' });

// Teacher & Class (1:1 per Teacher, 1:N overall depending on logic, let's say 1:N)
Class.hasMany(Teacher, { foreignKey: 'class_id', onDelete: 'SET NULL' });
Teacher.belongsTo(Class, { foreignKey: 'class_id' });

// Teacher & Attendance (1:N)
Teacher.hasMany(Attendance, { foreignKey: 'teacher_id', onDelete: 'SET NULL' });
Attendance.belongsTo(Teacher, { foreignKey: 'teacher_id' });

module.exports = {
  sequelize,
  User,
  Department,
  Class,
  Teacher,
  Student,
  Attendance,
  Notification
};
