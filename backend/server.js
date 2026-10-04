const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);

app.get('/', async (req,res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.send('Naga Services API Running + DB Connected!');
  } catch (err) {
    res.send('DB Error: ' + err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));