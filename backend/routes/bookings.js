const express = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Customer books a vendor
router.post('/', auth, async (req,res) => {
  const { vendor_id, service_date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO bookings (customer_id, vendor_id, service_date) VALUES (?,?,?)',
      [req.user.id, vendor_id, service_date]
    );
    res.json({ msg: 'Booked successfully!', id: result.insertId });
  } catch(err){ res.status(500).json({error: err.message}); }
});

// Get my bookings (customer or vendor)
router.get('/my', auth, async (req,res) => {
  try {
    let query = '';
    if (req.user.role === 'customer') {
      query = `SELECT b.*, v.business_name, v.category FROM bookings b JOIN vendors v ON b.vendor_id = v.id WHERE b.customer_id = ${req.user.id}`;
    } else {
      query = `SELECT b.*, u.name as customer_name, v.business_name FROM bookings b JOIN users u ON b.customer_id = u.id JOIN vendors v ON b.vendor_id = v.id WHERE v.user_id = ${req.user.id}`;
    }
    const [rows] = await db.query(query);
    res.json(rows);
  } catch(err){ res.status(500).json({error: err.message}); }
});

module.exports = router;