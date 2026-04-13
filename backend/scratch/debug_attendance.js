const axios = require('axios');

async function testMarkAttendance() {
  try {
    // 1. Login as teacher
    console.log("Logging in...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'Ajith Kumar',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Logged in!");

    // 2. Mark attendance
    console.log("Marking attendance...");
    try {
      const markRes = await axios.post('http://localhost:5000/api/teacher/mark', {
        class_id: 6,
        date: '2026-04-13',
        period: 1,
        student_id: 1, // Need a valid student id
        status: 'PRESENT'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Result:", markRes.data);
    } catch (err) {
      console.log("Error Response:", err.response?.data || err.message);
    }

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testMarkAttendance();
