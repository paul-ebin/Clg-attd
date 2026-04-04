const { Student, Attendance, Notification, Class, Department, Teacher, User } = require('../models');

exports.getDashboardData = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const attendanceRecords = await Attendance.findAll({
      where: { student_id: student.id }
    });

    const totalDays = attendanceRecords.length;
    let presentDays = 0;
    attendanceRecords.forEach(att => {
      if (att.status === 'PRESENT' || att.status === 'ON_DUTY') presentDays++;
    });

    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    const unreadNotifications = await Notification.count({
      where: { student_id: student.id, is_read: false }
    });

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
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    const history = await Attendance.findAll({
      where: { student_id: student.id },
      include: [
        Class,
        {
          model: Teacher,
          include: [{ model: User, attributes: ['name'] }]
        }
      ],
      order: [['date', 'DESC'], ['period', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    const notifications = await Notification.findAll({
      where: { student_id: student.id },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    
    const notification = await Notification.findOne({
      where: { id, student_id: student.id }
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.is_read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};
