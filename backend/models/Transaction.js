const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  voucherId: { type: String, required: true },
  amount: { type: Number, required: true },
  invoiceNumber: { type: String, required: true },
  restaurantName: { type: String, required: true },
  remainingBalance: { type: Number, required: true },
  hotelId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);