// routes/vouchers.js
const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');
const Voucher = require('../models/Voucher');
const Transaction = require('../models/Transaction');
const { auth, authorize } = require('../middleware/auth');

// Create voucher (Front Office only)
router.post('/', auth, authorize(['front_office', 'super_admin']), async (req, res) => {
  try {
    const { guestName, passportEID, roomNumber, amount, expiryDate } = req.body;
    
    // Generate serial number
    const count = await Voucher.countDocuments({ hotelId: req.user.hotelId });
    const serialNumber = `FAH${String(count + 1).padStart(3, '0')}`;
    
    // Generate QR code with serial number
    const qrData = JSON.stringify({
      serialNumber,
      amount,
      roomNumber,
      hotelId: req.user.hotelId,
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrData);
    
    const voucher = new Voucher({
      serialNumber,
      guestName,
      passportEID,
      roomNumber,
      totalAmount: amount,
      expiryDate: new Date(expiryDate),
      qrCode: qrCodeImage,
      hotelId: req.user.hotelId,
      createdBy: req.user.userId,
    });
    
    await voucher.save();
    res.status(201).json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search voucher (Restaurant)
router.get('/search', auth, authorize(['restaurant_manager', 'super_admin']), async (req, res) => {
  try {
    const { query } = req.query;
    
    const voucher = await Voucher.findOne({
      hotelId: req.user.hotelId,
      $or: [
        { serialNumber: query },
        { roomNumber: query },
        { passportEID: query },
      ],
    }).populate('createdBy', 'email');
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }
    
    // Check expiry
    if (new Date() > new Date(voucher.expiryDate)) {
      return res.status(400).json({ error: 'Voucher expired', expired: true });
    }
    
    if (voucher.status === 'fully_used') {
      return res.status(400).json({ error: 'Voucher fully used' });
    }
    
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem voucher (Restaurant)
router.post('/redeem/:id', auth, authorize(['restaurant_manager', 'super_admin']), async (req, res) => {
  try {
    const { amount, invoiceNumber } = req.body;
    const voucher = await Voucher.findOne({
      _id: req.params.id,
      hotelId: req.user.hotelId,
    });
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }
    
    if (new Date() > new Date(voucher.expiryDate)) {
      return res.status(400).json({ error: 'Voucher expired' });
    }
    
    if (voucher.balanceAmount < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    voucher.spentAmount += amount;
    voucher.balanceAmount -= amount;
    
    if (voucher.balanceAmount === 0) {
      voucher.status = 'fully_used';
    }
    
    await voucher.save();
    
    const transaction = new Transaction({
      voucherId: voucher._id,
      amount,
      invoiceNumber,
      restaurantName: req.user.restaurantName,
      remainingBalance: voucher.balanceAmount,
      hotelId: req.user.hotelId,
      createdBy: req.user.userId,
    });
    
    await transaction.save();
    
    res.json({ voucher, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vouchers (Accounts)
router.get('/', auth, authorize(['accounts', 'super_admin']), async (req, res) => {
  try {
    const vouchers = await Voucher.find({ hotelId: req.user.hotelId })
      .populate('createdBy', 'email')
      .sort('-createdAt');
    
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate voucher image
router.get('/generate-image/:id', auth, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }
    
    const templatePath = path.join(__dirname, '../templates/voucher-bg.png');
    const qrBuffer = await QRCode.toBuffer(voucher.qrCode);
    
    // Use sharp to overlay text and QR on template
    const image = await sharp(templatePath)
      .composite([
        {
          input: qrBuffer,
          top: 400,
          left: 500,
        },
      ])
      .toBuffer();
    
    res.set('Content-Type', 'image/png');
    res.send(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;