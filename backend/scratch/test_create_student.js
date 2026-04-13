const mysql = require('mysql2/promise');
require('dotenv').config();

async function testCreate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const reg_no = 'TEST_REG_123';
    const dob = '2000-01-01';
    const class_id = 6; // Valid class id from previous query
    const department_id = 1; // Valid dept id
    const name = 'Test Student';
    const email = 'test_stu_unique@gmail.com';

    console.log("Inserting into users...");
    const [userResult] = await connection.execute(
      'INSERT INTO users (username, password, name, email, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [reg_no, 'hashed_pass', name, email, 'STUDENT']
    );
    const userId = userResult.insertId;
    console.log("User inserted, ID:", userId);

    console.log("Inserting into students...");
    const [studentResult] = await connection.execute(
      'INSERT INTO students (user_id, reg_no, dob, class_id, department_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [userId, reg_no, dob, class_id, department_id]
    );
    console.log("Student inserted, ID:", studentResult.insertId);

    await connection.commit();
    console.log("Success!");
  } catch (error) {
    await connection.rollback();
    console.error("FAILED:", error.message);
    if (error.sqlMessage) console.error("SQL Error:", error.sqlMessage);
  } finally {
    connection.release();
    await pool.end();
  }
}

testCreate();
