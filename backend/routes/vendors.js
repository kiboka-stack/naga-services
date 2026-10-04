const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all vendors (public)
router.get('/', async (req,res) => {
  try {
    const [vendors] = await db.query(`
      SELECT v.*, u.name as owner_name FROM vendors v
      JOIN users u ON v.user_id = u.id
    `);
    res.json(vendors);
  } catch(err) { res.status(500).json({error: err.message}); }
});

// Create vendor profile (only logged in vendor)
router.post('/', auth, async (req,res) => {
  const { business_name, category, area, price_per_hour, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO vendors (user_id, business_name, category, area, price_per_hour, description, is_approved) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, business_name, category, area, price_per_hour, description, 1]
    );
    res.json({ msg: 'Vendor profile created', id: result.insertId });
  } catch(err) { res.status(500).json({error: err.message}); }
});

module.exports = router;