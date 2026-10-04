const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role, city } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email =?', [email]);
    if (existing.length > 0) return res.status(400).json({ msg: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, city) VALUES (?,?,?,?,?)',
      [name, email, hashed, role || 'customer', city || 'Kohima']
    );
    res.json({ msg: 'User registered', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email =?', [email]);
    if (users.length === 0) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    const token = jwt.sign({ id: users[0].id, role: users[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: users[0].id, name: users[0].name, email: users[0].email, role: users[0].role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;