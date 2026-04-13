const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Stats
exports.getStats = async (req, res) => {
  try {
    const [[{ totalTeachers }]] = await pool.query('SELECT COUNT(*) as totalTeachers FROM teachers');
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) as totalStudents FROM students');
    const [[{ totalClasses }]] = await pool.query('SELECT COUNT(*) as totalClasses FROM classes');
    const [[{ totalDepartments }]] = await pool.query('SELECT COUNT(*) as totalDepartments FROM departments');

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
    const [result] = await pool.execute(
      'INSERT INTO departments (name, createdAt, updatedAt) VALUES (?, NOW(), NOW())',
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const [departments] = await pool.execute('SELECT * FROM departments');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Classes
exports.createClass = async (req, res) => {
  try {
    const { name, department_id, section } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO classes (name, department_id, section, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [name, department_id, section]
    );
    res.status(201).json({ id: result.insertId, name, department_id, section });
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const [classes] = await pool.execute(`
      SELECT c.*, d.name as department_name 
      FROM classes c 
      LEFT JOIN departments d ON c.department_id = d.id
    `);
    // Format to match Sequelize-like response if frontend expects nested objects
    const formattedClasses = classes.map(c => ({
      ...c,
      Department: c.department_name ? { id: c.department_id, name: c.department_name } : null
    }));
    res.json(formattedClasses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

// Teachers
exports.createTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const { username, password, department_id, class_id, name, email } = req.body;
    
    // Check if user exists
    const [existing] = await connection.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, plain_password, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [username, hashedPassword, password, name || null, email || null, 'TEACHER']
    );

    const userId = userResult.insertId;

    // Create teacher
    const [teacherResult] = await connection.execute(
      'INSERT INTO teachers (user_id, department_id, class_id, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [userId, department_id, class_id || null]
    );

    await connection.commit();
    res.status(201).json({ 
      user: { id: userId, username, name: name || null, email: email || null, role: 'TEACHER' }, 
      teacher: { id: teacherResult.insertId, user_id: userId, department_id, class_id: class_id || null } 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating teacher:', error);
    res.status(500).json({ message: 'Error creating teacher', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const [teachers] = await pool.execute(`
      SELECT 
        t.*, 
        u.username, u.role, u.name as user_name, u.email, u.plain_password,
        d.name as department_name,
        c.name as class_name, c.section as class_section
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN classes c ON t.class_id = c.id
    `);

    const formattedTeachers = teachers.map(t => ({
      ...t,
      User: { id: t.user_id, username: t.username, role: t.role, name: t.user_name, email: t.email, plain_password: t.plain_password },
      Department: t.department_id ? { id: t.department_id, name: t.department_name } : null,
      Class: t.class_id ? { id: t.class_id, name: t.class_name, section: t.class_section } : null
    }));
    
    res.json(formattedTeachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const { id } = req.params;
    const { username, password, department_id, class_id, name, email } = req.body;

    const [teachers] = await connection.execute('SELECT user_id FROM teachers WHERE id = ?', [id]);
    if (teachers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const userId = teachers[0].user_id;

    // Update user
    let userQuery = 'UPDATE users SET updatedAt = NOW()';
    const userParams = [];
    if (username) { userQuery += ', username = ?'; userParams.push(username); }
    if (name) { userQuery += ', name = ?'; userParams.push(name); }
    if (email) { userQuery += ', email = ?'; userParams.push(email); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userQuery += ', password = ?, plain_password = ?';
      userParams.push(hashedPassword, password);
    }
    userQuery += ' WHERE id = ?';
    userParams.push(userId);
    await connection.execute(userQuery, userParams);

    // Update teacher
    let teacherQuery = 'UPDATE teachers SET updatedAt = NOW()';
    const teacherParams = [];
    if (department_id) { teacherQuery += ', department_id = ?'; teacherParams.push(department_id); }
    if (class_id !== undefined) {
      teacherQuery += ', class_id = ?';
      teacherParams.push(class_id === '' ? null : class_id);
    }
    teacherQuery += ' WHERE id = ?';
    teacherParams.push(id);
    await connection.execute(teacherQuery, teacherParams);

    await connection.commit();
    res.json({ message: 'Teacher updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error updating teacher', error: error.message });
  } finally {
    connection.release();
  }
};

// Students
exports.createStudent = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    console.log('Incoming Student Data:', req.body);
    const { reg_no, dob, class_id, department_id, name, email } = req.body;
    
    const numClassId = Number(class_id);
    const numDeptId = Number(department_id);

    if (!reg_no || !dob || !numClassId || !numDeptId) {
       await connection.rollback();
       return res.status(400).json({ message: 'Missing required fields: reg_no, dob, class_id, and department_id are mandatory.' });
    }
    console.log('Checking for existing username:', reg_no);
    const [existingUser] = await connection.execute('SELECT id FROM users WHERE username = ?', [reg_no]);
    if (existingUser.length > 0) {
      console.warn('Student Creation Failed: Username already exists', reg_no);
      await connection.rollback();
      return res.status(400).json({ message: 'Student Register Number already exists as a username' });
    }

    if (email) {
      console.log('Checking for existing email:', email);
      const [existingEmail] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail.length > 0) {
        console.warn('Student Creation Failed: Email already exists', email);
        await connection.rollback();
        return res.status(400).json({ message: 'Email address is already in use by another user' });
      }
    }

    const hashedPassword = await bcrypt.hash(String(dob), 10);
    
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [reg_no, hashedPassword, name || null, email || null, 'STUDENT']
    );

    const userId = userResult.insertId;

    const [studentResult] = await connection.execute(
      'INSERT INTO students (user_id, reg_no, dob, class_id, department_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, reg_no, dob, numClassId, numDeptId]
    );

    await connection.commit();
    res.status(201).json({ 
      user: { id: userId, username: reg_no, name: name || null, email: email || null, role: 'STUDENT' }, 
      student: { id: studentResult.insertId, user_id: userId, reg_no, dob, class_id, department_id } 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Error creating student', error: error.message });
  } finally {
    connection.release();
  }
};

exports.getStudents = async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT 
        s.*, 
        u.username, u.name as user_name, u.email,
        d.name as department_name,
        c.name as class_name, c.section as class_section
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN classes c ON s.class_id = c.id
    `);

    const formattedStudents = students.map(s => ({
      ...s,
      User: { id: s.user_id, username: s.username, name: s.user_name, email: s.email },
      Department: s.department_id ? { id: s.department_id, name: s.department_name } : null,
      Class: s.class_id ? { id: s.class_id, name: s.class_name, section: s.class_section } : null
    }));
    
    res.json(formattedStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const { id } = req.params;
    const { reg_no, dob, class_id, department_id, name, email } = req.body;

    const [students] = await connection.execute('SELECT user_id FROM students WHERE id = ?', [id]);
    if (students.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Student not found' });
    }
    const userId = students[0].user_id;

    // Update user
    let userQuery = 'UPDATE users SET updatedAt = NOW()';
    const userParams = [];
    if (reg_no) { userQuery += ', username = ?'; userParams.push(reg_no); }
    if (name) { userQuery += ', name = ?'; userParams.push(name); }
    if (email) { userQuery += ', email = ?'; userParams.push(email); }
    if (dob) {
      const hashedPassword = await bcrypt.hash(dob, 10);
      userQuery += ', password = ?';
      userParams.push(hashedPassword);
    }
    userQuery += ' WHERE id = ?';
    userParams.push(userId);
    await connection.execute(userQuery, userParams);

    // Update student
    let studentQuery = 'UPDATE students SET updatedAt = NOW()';
    const studentParams = [];
    if (reg_no) { studentQuery += ', reg_no = ?'; studentParams.push(reg_no); }
    if (dob) { studentQuery += ', dob = ?'; studentParams.push(dob); }
    if (class_id) { studentQuery += ', class_id = ?'; studentParams.push(class_id); }
    if (department_id) { studentQuery += ', department_id = ?'; studentParams.push(department_id); }
    studentQuery += ' WHERE id = ?';
    studentParams.push(id);
    await connection.execute(studentQuery, studentParams);

    await connection.commit();
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error updating student', error: error.message });
  } finally {
    connection.release();
  }
};

// Reports
exports.getAttendanceReports = async (req, res) => {
  try {
    const { class_id, date } = req.query;
    
    let query = `
      SELECT 
        a.*,
        s.reg_no, s.user_id as student_user_id,
        su.username as student_username, su.name as student_display_name,
        sd.name as student_department_name,
        tu.name as teacher_display_name,
        c.name as class_name, c.section as class_section
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users su ON s.user_id = su.id
      LEFT JOIN departments sd ON s.department_id = sd.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      LEFT JOIN classes c ON a.class_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    const [records] = await pool.execute(query, params);

    const formattedRecords = records.map(r => ({
      ...r,
      Student: { 
        id: r.student_id, 
        reg_no: r.reg_no, 
        User: { username: r.student_username, name: r.student_display_name },
        Department: { name: r.student_department_name }
      },
      Teacher: { 
        id: r.teacher_id, 
        User: { name: r.teacher_display_name } 
      },
      Class: { id: r.class_id, name: r.class_name, section: r.class_section }
    }));

    res.json(formattedRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};
