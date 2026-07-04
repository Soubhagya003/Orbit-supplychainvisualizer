const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Error: Username is already taken!' });
    }

    // Set default role if none provided
    let userRoles = ['ROLE_USER'];
    if (roles && Array.isArray(roles)) {
      userRoles = roles.map(role => {
        if (role === 'admin') return 'ROLE_ADMIN';
        if (role === 'mod') return 'ROLE_MODERATOR';
        return 'ROLE_USER';
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      roles: userRoles
    });

    await newUser.save();
    return res.status(200).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign(
      { id: user.id, username: user.username, roles: user.roles },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      type: 'Bearer',
      id: user.id,
      username: user.username,
      email: user.email || '',
      roles: user.roles
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;
