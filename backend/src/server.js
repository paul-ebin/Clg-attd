require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET') console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const errorLog = `
--- ERROR START ---
Time: ${new Date().toISOString()}
Request: ${req.method} ${req.url}
Body: ${JSON.stringify(req.body, null, 2)}
Error Stack: ${err.stack}
Error Message: ${err.message}
--- ERROR END ---
\n`;
  console.error(errorLog);
  try {
    fs.appendFileSync(path.join(__dirname, '../diagnostic.log'), errorLog);
  } catch (logError) {
    console.error('Failed to write to diagnostic.log:', logError);
  }
  res.status(500).json({ message: err.message || 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('Database connected successfully using MySQL Pool.');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
