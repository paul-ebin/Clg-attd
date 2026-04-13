const pool = require('../config/db');
const { sendLowAttendanceEmail } = require('../utils/emailService');

exports.getAssignedClasses = async (req, res) => {
  try {
    const [teachers] = await pool.execute(
      'SELECT class_id FROM teachers WHERE user_id = ?',
      [req.user.id]
    );
    
    if (teachers.length === 0) return res.status(404).json({ message: 'Teacher profile not found' });

    const teacher = teachers[0];
    if (!teacher.class_id) {
      return res.json([]);
    }
    
    const [classes] = await pool.execute(
      'SELECT * FROM classes WHERE id = ?',
      [teacher.class_id]
    );
    
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [students] = await pool.execute(`
      SELECT s.*, u.username, u.name 
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.class_id = ?
    `, [classId]);

    // Calculate attendance percentage for each student
    const studentsWithPercentage = await Promise.all(students.map(async (student) => {
      const [allAttendance] = await pool.execute(
        'SELECT status FROM attendance WHERE student_id = ?',
        [student.id]
      );

      const totalDays = allAttendance.length;
      let presentDays = 0;
      allAttendance.forEach(att => {
        if (att.status === 'PRESENT' || att.status === 'ON_DUTY') {
          presentDays++;
        }
      });

      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return {
        ...student,
        User: { username: student.username, name: student.name },
        attendance_percentage: percentage.toFixed(1)
      };
    }));

    res.json(studentsWithPercentage);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
};

exports.getAttendanceRecords = async (req, res) => {
  try {
    const { class_id, date, period } = req.query;
    
    let query = `
      SELECT 
        a.*,
        s.reg_no,
        su.username as student_username, su.name as student_display_name,
        tu.name as teacher_display_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users su ON s.user_id = su.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
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
    if (period) {
      query += ' AND a.period = ?';
      params.push(period);
    }

    const [records] = await pool.execute(query, params);
    
    const formattedRecords = records.map(r => ({
      ...r,
      Student: { 
        id: r.student_id, 
        reg_no: r.reg_no,
        User: { username: r.student_username, name: r.student_display_name } 
      },
      Teacher: { 
        id: r.teacher_id, 
        User: { name: r.teacher_display_name } 
      }
    }));
    
    res.json(formattedRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const { class_id, date, period, student_id, status } = req.body;
    
    // Find teacher
    const [teachers] = await connection.execute(`
      SELECT t.id, u.name 
      FROM teachers t 
      JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = ?
    `, [req.user.id]);
    
    if (teachers.length === 0) throw new Error('Teacher not found');
    const teacher = teachers[0];

    // Find student
    const [students] = await connection.execute(`
      SELECT s.id, u.name, u.username, u.email 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = ?
    `, [student_id]);
    
    if (students.length === 0) throw new Error('Student not found');
    const student = students[0];

    const studentName = student.name || student.username || null;
    const teacherName = teacher.name || null;

    // Check if attendance already exists
    const [existing] = await connection.execute(
      'SELECT id FROM attendance WHERE student_id = ? AND date = ? AND period = ?',
      [student_id, date, period]
    );

    let attendanceRecordId;
    if (existing.length > 0) {
      // Update existing
      await connection.execute(`
        UPDATE attendance 
        SET status = ?, class_id = ?, teacher_id = ?, student_name = ?, teacher_name = ?, updatedAt = NOW()
        WHERE id = ?
      `, [status, class_id, teacher.id, studentName, teacherName, existing[0].id]);
      attendanceRecordId = existing[0].id;
    } else {
      // Create new
      const [insertResult] = await connection.execute(`
        INSERT INTO attendance (student_id, class_id, date, period, status, teacher_id, student_name, teacher_name, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [student_id, class_id, date, period, status, teacher.id, studentName, teacherName]);
      attendanceRecordId = insertResult.insertId;
    }

    // Recalculate Attendance Percentage
    const [allAttendance] = await connection.execute(
      'SELECT status FROM attendance WHERE student_id = ?',
      [student_id]
    );

    const totalDays = allAttendance.length;
    let presentDays = 0;
    allAttendance.forEach(att => {
      if (att.status === 'PRESENT' || att.status === 'ON_DUTY') {
        presentDays++;
      }
    });
    
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Check threshold for notifications
    if (percentage < 80) {
      const [existingNotif] = await connection.execute(`
        SELECT id FROM notifications 
        WHERE student_id = ? AND is_read = 0 AND message LIKE 'Warning: Your attendance%'
      `, [student_id]);

      if (existingNotif.length === 0) {
        await connection.execute(`
          INSERT INTO notifications (student_id, message, is_read, created_at)
          VALUES (?, ?, 0, NOW())
        `, [student_id, `Warning: Your attendance is below 80% (Current: ${percentage.toFixed(1)}%). Please improve to avoid academic issues.`]);
      }

      if (student.email) {
        sendLowAttendanceEmail(
          student.email, 
          studentName, 
          percentage.toFixed(1)
        ).catch(err => console.error("Email sending background error:", err));
      }
    }

    await connection.commit();
    res.status(200).json({ 
      message: 'Attendance marked successfully', 
      record: { id: attendanceRecordId, student_id, class_id, date, period, status }, 
      percentage 
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error marking attendance.', error: error.message });
  } finally {
    connection.release();
  }
};
