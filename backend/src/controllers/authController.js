const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.setupAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if admin already exists
    const [existingAdmins] = await pool.execute(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      ['ADMIN']
    );
    
    if (existingAdmins.length > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, role, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
      [username, hashedPassword, 'ADMIN']
    );

    res.status(201).json({ 
      message: 'Admin created successfully', 
      user: { id: result.insertId, username } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Fetch user by username
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    let profileData = null;
    if (user.role === 'TEACHER') {
      const [teachers] = await pool.execute(
        'SELECT * FROM teachers WHERE user_id = ?',
        [user.id]
      );
      profileData = teachers[0] || null;
    } else if (user.role === 'STUDENT') {
      const [students] = await pool.execute(
        'SELECT * FROM students WHERE user_id = ?',
        [user.id]
      );
      profileData = students[0] || null;
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profile: profileData
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    let profileData = null;
    if (user.role === 'TEACHER') {
      const [teachers] = await pool.execute(
        'SELECT * FROM teachers WHERE user_id = ?',
        [user.id]
      );
      profileData = teachers[0] || null;
    } else if (user.role === 'STUDENT') {
      const [students] = await pool.execute(
        'SELECT * FROM students WHERE user_id = ?',
        [user.id]
      );
      profileData = students[0] || null;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        profile: profileData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
