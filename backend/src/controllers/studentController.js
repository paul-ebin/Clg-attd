const pool = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const studentId = students[0].id;

    const [attendanceRecords] = await pool.execute(
      'SELECT status FROM attendance WHERE student_id = ?',
      [studentId]
    );

    const totalDays = attendanceRecords.length;
    let presentDays = 0;
    attendanceRecords.forEach(att => {
      if (att.status === 'PRESENT' || att.status === 'ON_DUTY') presentDays++;
    });

    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    const [rows] = await pool.execute(
      'SELECT COUNT(*) as unreadNotifications FROM notifications WHERE student_id = ? AND is_read = 0',
      [studentId]
    );
    const unreadNotifications = Number(rows[0]?.unreadNotifications || 0);

    res.json({
      percentage,
      totalDays,
      presentDays,
      unreadNotifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const studentId = students[0].id;

    const [history] = await pool.execute(`
      SELECT 
        a.*,
        c.name as class_name, c.section as class_section,
        tu.name as teacher_display_name
      FROM attendance a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC, a.period DESC
    `, [studentId]);

    const formattedHistory = history.map(h => ({
      ...h,
      Class: h.class_id ? { id: h.class_id, name: h.class_name, section: h.class_section } : null,
      Teacher: h.teacher_id ? { id: h.teacher_id, User: { name: h.teacher_display_name } } : null
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const studentId = students[0].id;

    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC',
      [studentId]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const studentId = students[0].id;
    
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?',
      [id, studentId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};
