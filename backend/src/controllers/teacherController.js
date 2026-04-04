const { Teacher, Class, Student, User, Attendance, Notification, Department, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendLowAttendanceEmail } = require('../utils/emailService');

exports.getAssignedClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    if (!teacher.class_id) {
      return res.json([]);
    }
    
    // Only return the assigned class section
    const assignedClass = await Class.findByPk(teacher.class_id);
    res.json(assignedClass ? [assignedClass] : []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error: error.message });
  }
};

exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await Student.findAll({
      where: { class_id: classId },
      include: [
        { model: User, attributes: ['username', 'name'] }
      ]
    });

    // Calculate attendance percentage for each student
    const studentsWithPercentage = await Promise.all(students.map(async (student) => {
      const allAttendance = await Attendance.findAll({
        where: { student_id: student.id }
      });

      const totalDays = allAttendance.length;
      let presentDays = 0;
      allAttendance.forEach(att => {
        if (att.status === 'PRESENT' || att.status === 'ON_DUTY') {
          presentDays++;
        }
      });

      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
      
      return {
        ...student.toJSON(),
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
    let whereClause = {};
    if (class_id) whereClause.class_id = class_id;
    if (date) whereClause.date = date;
    if (period) whereClause.period = period;

    const records = await Attendance.findAll({
      where: whereClause,
      include: [
        { model: Student, include: [ { model: User, attributes: ['username'] } ] }
      ]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { class_id, date, period, student_id, status } = req.body;
    
    // Find the teacher
    const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
    if (!teacher) throw new Error('Teacher not found');

    // Check if attendance already exists
    const existing = await Attendance.findOne({
      where: { student_id, date, period }
    });

    let attendanceRecord;
    if (existing) {
      // Update existing
      existing.status = status;
      existing.class_id = class_id;
      existing.teacher_id = teacher.id;
      attendanceRecord = await existing.save({ transaction });
    } else {
      // Create new
      attendanceRecord = await Attendance.create({
        student_id,
        class_id,
        date,
        period,
        status,
        teacher_id: teacher.id
      }, { transaction });
    }

    // Recalculate Attendance Percentage for this student
    const allAttendance = await Attendance.findAll({
      where: { student_id },
      transaction
    });

    const totalDays = allAttendance.length;
    let presentDays = 0;
    allAttendance.forEach(att => {
      // Count PRESENT and ON_DUTY as present days for percentage
      if (att.status === 'PRESENT' || att.status === 'ON_DUTY') {
        presentDays++;
      }
    });
    
    // Update newly marked logic in memory
    // Wait, the new record is already in allAttendance since we queried after create/save
    
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Check against threshold
    if (percentage < 80) {
      // Prevent duplicate notifications within the same day/week maybe?
      // For simplicity, check if there's already an UNREAD warning notification
      const existingUnreadNotif = await Notification.findOne({
        where: {
          student_id,
          is_read: false,
          message: {
            [Op.like]: 'Warning: Your attendance%'
          }
        },
        transaction
      });

      if (!existingUnreadNotif) {
        await Notification.create({
          student_id,
          message: `Warning: Your attendance is below 80% (Current: ${percentage.toFixed(1)}%). Please improve to avoid academic issues.`
        }, { transaction });
      }

      // Always try to send email if student has one and attendance is low
      const student = await Student.findByPk(student_id, {
        include: [{ model: User, attributes: ['email', 'name', 'username'] }],
        transaction
      });

      if (student.User && student.User.email) {
        // Send email and log any errors without failing the main transaction
        sendLowAttendanceEmail(
          student.User.email, 
          student.User.name || student.User.username, 
          percentage.toFixed(1)
        ).catch(err => console.error("Email sending background error:", err));
      }
    }

    await transaction.commit();
    res.status(200).json({ message: 'Attendance marked successfully', record: attendanceRecord, percentage });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error marking attendance. Ensure not duplicate per day.', error: error.message });
  }
};
