const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (replace with MongoDB later)
let users = [];
let hotels = [];
let vouchers = [];
let transactions = [];
let voucherCounter = 0;

// Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Setup
app.get('/api/auth/setup', async (req, res) => {
  const hotel = { _id: '1', name: 'Fortune Atrium Hotel', subdomain: 'fortune' };
  hotels.push(hotel);
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const users_list = [
    { _id: '1', email: 'admin@grandluxury.com', password: hashedPassword, role: 'super_admin', hotelId: '1', isActive: true },
    { _id: '2', email: 'frontoffice@grandluxury.com', password: await bcrypt.hash('Front@123', 10), role: 'front_office', hotelId: '1', isActive: true },
    { _id: '3', email: 'restaurant@grandluxury.com', password: await bcrypt.hash('Rest@123', 10), role: 'restaurant_manager', hotelId: '1', isActive: true, restaurantName: 'Main Restaurant' },
    { _id: '4', email: 'accounts@grandluxury.com', password: await bcrypt.hash('Acc@123', 10), role: 'accounts', hotelId: '1', isActive: true }
  ];
  users.push(...users_list);
  res.json({ message: 'Setup complete! Users created.', users: users_list.map(u => ({ email: u.email, role: u.role, password: u.email.includes('admin') ? 'Admin@123' : u.email.includes('front') ? 'Front@123' : u.email.includes('restaurant') ? 'Rest@123' : 'Acc@123' })) });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, subdomain } = req.body;
  const hotel = hotels.find(h => h.subdomain === subdomain);
  if (!hotel) return res.status(401).json({ error: 'Invalid hotel domain' });
  const user = users.find(u => u.email === email && u.hotelId === hotel._id);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.isActive) return res.status(401).json({ error: 'Account disabled' });
  const token = jwt.sign({ userId: user._id, role: user.role, hotelId: hotel._id, restaurantName: user.restaurantName }, 'secretkey', { expiresIn: '24h' });
  res.json({ token, user: { id: user._id, email: user.email, role: user.role, hotelId: hotel._id, restaurantName: user.restaurantName } });
});

// Create Voucher (Front Office)
app.post('/api/vouchers', auth, authorize(['front_office', 'super_admin']), async (req, res) => {
  const { guestName, passportEID, roomNumber, amount, expiryDate } = req.body;
  voucherCounter++;
  const serialNumber = `FAH${String(voucherCounter).padStart(3, '0')}`;
  const qrData = JSON.stringify({ serialNumber, amount, roomNumber });
  const qrCode = await QRCode.toDataURL(qrData);
  const voucher = {
    _id: String(Date.now()),
    serialNumber, guestName, passportEID, roomNumber,
    totalAmount: parseInt(amount), spentAmount: 0, balanceAmount: parseInt(amount),
    expiryDate: new Date(expiryDate), qrCode, status: 'active',
    hotelId: req.user.hotelId, createdBy: req.user.userId, createdAt: new Date()
  };
  vouchers.push(voucher);
  res.status(201).json(voucher);
});

// Get All Vouchers (Accounts)
app.get('/api/vouchers', auth, authorize(['accounts', 'super_admin']), (req, res) => {
  const userVouchers = vouchers.filter(v => v.hotelId === req.user.hotelId);
  res.json(userVouchers);
});

// Search Voucher (Restaurant)
app.get('/api/vouchers/search', auth, authorize(['restaurant_manager', 'super_admin']), (req, res) => {
  const { query } = req.query;
  const voucher = vouchers.find(v => v.hotelId === req.user.hotelId && 
    (v.serialNumber === query || v.roomNumber === query || v.passportEID === query));
  if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
  if (new Date() > new Date(voucher.expiryDate)) return res.status(400).json({ error: 'Voucher expired', expired: true });
  if (voucher.status === 'fully_used') return res.status(400).json({ error: 'Voucher fully used' });
  res.json(voucher);
});

// Redeem Voucher (Restaurant)
app.post('/api/vouchers/redeem/:id', auth, authorize(['restaurant_manager', 'super_admin']), (req, res) => {
  const { amount, invoiceNumber } = req.body;
  const voucherIndex = vouchers.findIndex(v => v._id === req.params.id && v.hotelId === req.user.hotelId);
  if (voucherIndex === -1) return res.status(404).json({ error: 'Voucher not found' });
  const voucher = vouchers[voucherIndex];
  if (new Date() > new Date(voucher.expiryDate)) return res.status(400).json({ error: 'Voucher expired' });
  if (voucher.balanceAmount < amount) return res.status(400).json({ error: 'Insufficient balance' });
  
  voucher.spentAmount += amount;
  voucher.balanceAmount -= amount;
  if (voucher.balanceAmount === 0) voucher.status = 'fully_used';
  vouchers[voucherIndex] = voucher;
  
  const transaction = {
    _id: String(Date.now()),
    voucherId: voucher._id, amount, invoiceNumber,
    restaurantName: req.user.restaurantName, remainingBalance: voucher.balanceAmount,
    hotelId: req.user.hotelId, createdAt: new Date()
  };
  transactions.push(transaction);
  res.json({ voucher, transaction });
});

// Get Transactions
app.get('/api/transactions/voucher/:voucherId', auth, (req, res) => {
  const voucherTransactions = transactions.filter(t => t.voucherId === req.params.voucherId && t.hotelId === req.user.hotelId);
  res.json(voucherTransactions);
});

// Get Users (Super Admin)
app.get('/api/users', auth, authorize(['super_admin']), (req, res) => {
  const hotelUsers = users.filter(u => u.hotelId === req.user.hotelId).map(u => ({ ...u, password: undefined }));
  res.json(hotelUsers);
});

// Create User (Super Admin)
app.post('/api/users', auth, authorize(['super_admin']), async (req, res) => {
  const { email, password, role, restaurantName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    _id: String(Date.now()),
    email, password: hashedPassword, role,
    restaurantName: role === 'restaurant_manager' ? restaurantName : undefined,
    hotelId: req.user.hotelId, isActive: true
  };
  users.push(newUser);
  res.json({ message: 'User created', user: { ...newUser, password: undefined } });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hotel Voucher System API Running!', endpoints: ['/api/auth/setup', '/api/auth/login', '/api/vouchers', '/api/vouchers/search', '/api/vouchers/redeem/:id'] });
});

app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
  console.log('📝 Setup: http://localhost:5000/api/auth/setup');
});
// Create User (Super Admin)
app.post('/api/users', auth, authorize(['super_admin']), async (req, res) => {
  const { email, password, role, restaurantName, tasks, loginId, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    _id: String(Date.now()),
    email, password: hashedPassword, role, name, loginId,
    tasks: tasks || [],
    restaurantName: role === 'restaurant_manager' ? restaurantName : undefined,
    hotelId: req.user.hotelId,
    isActive: true,
    createdAt: new Date()
  };
  users.push(newUser);
  res.json({ message: 'User created successfully', user: { ...newUser, password: undefined } });
});

// Get All Users
app.get('/api/users', auth, authorize(['super_admin']), (req, res) => {
  const hotelUsers = users.filter(u => u.hotelId === req.user.hotelId).map(u => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
  res.json(hotelUsers);
});