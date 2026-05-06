// models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
  },
  address: String,
  phone: String,
  email: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Hotel', hotelSchema);