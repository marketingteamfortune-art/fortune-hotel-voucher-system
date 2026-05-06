// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

router.post('/login', async (req, res) => {
  try {
    const { email, password, subdomain } = req.body;
    
    const hotel = await Hotel.findOne({ subdomain });
    if (!hotel) {
      return res.status(401).json({ error: 'Invalid hotel domain' });
    }
    
    const user = await User.findOne({ email, hotelId: hotel._id });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account disabled' });
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role, hotelId: hotel._id },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        restaurantName: user.restaurantName,
        hotelId: hotel._id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;