const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Teacher, Student } = require('../models');

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
    const adminExists = await User.findOne({ where: { role: 'ADMIN' } });
    
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      username,
      password: hashedPassword,
      role: 'ADMIN'
    });

    res.status(201).json({ message: 'Admin created successfully', user: { id: admin.id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    let profileData = null;
    if (user.role === 'TEACHER') {
      profileData = await Teacher.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'STUDENT') {
      profileData = await Student.findOne({ where: { user_id: user.id } });
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
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = null;
    if (user.role === 'TEACHER') {
      profileData = await Teacher.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'STUDENT') {
      profileData = await Student.findOne({ where: { user_id: user.id } });
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
