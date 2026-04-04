const bcrypt = require('bcrypt');
const { User, Department, Class, Teacher, Student, Attendance, sequelize } = require('../models');

// Stats
exports.getStats = async (req, res) => {
  try {
    const totalTeachers = await Teacher.count();
    const totalStudents = await Student.count();
    const totalClasses = await Class.count();
    const totalDepartments = await Department.count();

    res.json({
      totalTeachers,
      totalStudents,
      totalClasses,
      totalDepartments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Departments
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const department = await Department.create({ name });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Classes
exports.createClass = async (req, res) => {
  try {
    const { name, department_id, section } = req.body;
    const newClass = await Class.create({ name, department_id, section });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({ include: [Department] });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

// Teachers
exports.createTeacher = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { username, password, department_id, class_id, name, email } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password: hashedPassword,
      plain_password: password, // Store plain password as requested
      name,
      email,
      role: 'TEACHER'
    }, { transaction });

    const teacher = await Teacher.create({
      user_id: user.id,
      department_id,
      class_id: class_id || null
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ user, teacher });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error creating teacher', error: error.message });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'role', 'name', 'email', 'plain_password'] },
        Department,
        Class
      ]
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { username, password, department_id, class_id, name, email } = req.body;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const user = await User.findByPk(teacher.user_id);
    
    // Update user fields
    user.username = username || user.username;
    user.name = name || user.name;
    user.email = email || user.email;
    
    if (password) {
      user.password = await bcrypt.hash(password, 10);
      user.plain_password = password;
    }

    await user.save({ transaction });

    // Update teacher fields
    teacher.department_id = department_id || teacher.department_id;
    if (class_id !== undefined) {
      teacher.class_id = class_id === '' ? null : class_id;
    }
    await teacher.save({ transaction });

    await transaction.commit();
    res.json({ message: 'Teacher updated successfully', teacher, user });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error updating teacher', error: error.message });
  }
};

// Students
exports.createStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { reg_no, dob, class_id, department_id, name, email } = req.body;
    
    const userExists = await User.findOne({ where: { username: reg_no } });
    if (userExists) {
      return res.status(400).json({ message: 'Student Register Number already exists' });
    }

    // Student password is their DOB (YYYY-MM-DD format commonly, but let's just hash it)
    const hashedPassword = await bcrypt.hash(dob, 10);
    
    const user = await User.create({
      username: reg_no,
      password: hashedPassword,
      name,
      email,
      role: 'STUDENT'
    }, { transaction });

    const student = await Student.create({
      user_id: user.id,
      reg_no,
      dob,
      class_id,
      department_id
    }, { transaction });

    await transaction.commit();
    res.status(201).json({ user, student });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'name', 'email'] },
        Department,
        Class
      ]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { reg_no, dob, class_id, department_id, name, email } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const user = await User.findByPk(student.user_id);

    // Update user fields
    user.username = reg_no || user.username;
    user.name = name || user.name;
    user.email = email || user.email;

    if (dob && dob !== student.dob) {
      // If DOB changed, update password as well (assuming DOB is password policy)
      user.password = await bcrypt.hash(dob, 10);
    }

    await user.save({ transaction });

    // Update student fields
    student.reg_no = reg_no || student.reg_no;
    student.dob = dob || student.dob;
    student.class_id = class_id || student.class_id;
    student.department_id = department_id || student.department_id;
    await student.save({ transaction });

    await transaction.commit();
    res.json({ message: 'Student updated successfully', student, user });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
};

// Reports
exports.getAttendanceReports = async (req, res) => {
  try {
    const { class_id, department_id, start_date, end_date } = req.query;
    
    let whereClause = {};
    if (class_id) whereClause.class_id = class_id;
    
    // Add date filtering if needed...

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        { 
          model: Student, 
          include: [
            { model: User, attributes: ['username'] }, 
            Department
          ] 
        },
        Class
      ]
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};
