const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  guestName: { type: String, required: true },
  passportEID: { type: String, required: true },
  roomNumber: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: function() { return this.totalAmount; } },
  expiryDate: { type: Date, required: true },
  qrCode: { type: String },
  status: { type: String, enum: ['active', 'expired', 'fully_used'], default: 'active' },
  hotelId: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voucher', voucherSchema);