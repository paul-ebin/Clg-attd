const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendLowAttendanceEmail = async (studentEmail, studentName, percentage) => {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'Attendance System'} <${process.env.EMAIL_FROM}>`,
      to: studentEmail,
      subject: "Low Attendance Alert",
      text: `Dear ${studentName},\n\nYour attendance has fallen below 80% (Current: ${percentage}%). Please ensure you attend classes regularly to maintain the required attendance.\n\nBest Regards,\nAttendance Management System`,
      html: `<p>Dear <strong>${studentName}</strong>,</p>
             <p>Your attendance has fallen below 80% (Current: <strong>${percentage}%</strong>).</p>
             <p>Please ensure you attend classes regularly to maintain the required attendance.</p>
             <br/>
             <p>Best Regards,<br/>Attendance Management System</p>`
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // We don't want to crash the whole process if email fails
    return null;
  }
};
