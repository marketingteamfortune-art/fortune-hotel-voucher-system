import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px' },
  card: { background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' },
  title: { color: '#F59E0B', marginBottom: '15px' },
  input: { width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', marginBottom: '10px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', marginBottom: '10px' },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  deleteBtn: { background: '#EF4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', background: '#0F172A', color: '#FBBF24' },
  td: { padding: '12px', borderBottom: '1px solid #334155', color: 'white' }
};

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: 'Freddys', subdomain: 'bar', email: 'freddys@fortune.ae', password: 'dron@123' },
    { id: 2, name: 'Rasa Coastal Vibes', subdomain: 'coastal', email: 'rasa@fortune.ae', password: 'goan@123' },
    { id: 3, name: 'Desi Dhaba', subdomain: 'punjabi', email: 'dhaba@fortune.ae', password: 'punjabi@137' },
    { id: 4, name: 'Ascent Rooftop', subdomain: 'rooftop', email: 'ascent@fortune.ae', password: 'missile@123' },
    { id: 5, name: 'Room Service', subdomain: 'rid', email: 'service@fortune.ae', password: 'rid@321' }
  ]);
  const [form, setForm] = useState({ email: '', password: '', role: '', restaurantName: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ User created successfully!');
      fetchUsers();
      setForm({ email: '', password: '', role: '', restaurantName: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error creating user');
    }
  };

  const getRoleAccess = (role) => {
    switch(role) {
      case 'super_admin': return '👑 Full Access - All Modules';
      case 'accounts': return '📊 Accounts Module - Reports Only';
      case 'front_office': return '🎫 Front Office - Create Vouchers Only';
      case 'restaurant_manager': return '🍽️ Restaurant - Redeem Vouchers Only';
      default: return 'No Access';
    }
  };

  return (
    <div style={styles.container}>
      {/* Create User Form */}
      <div style={styles.card}>
        <h2 style={styles.title}>👥 Create New User & Assign Access</h2>
        <form onSubmit={createUser}>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={styles.input} required />
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={styles.input} required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value, restaurantName: '' })} style={styles.select} required>
            <option value="">Select Role</option>
            <option value="front_office">Front Office Staff</option>
            <option value="accounts">Accounts Department</option>
            <option value="restaurant_manager">Restaurant Manager</option>
          </select>
          
          {form.role === 'restaurant_manager' && (
            <select value={form.restaurantName} onChange={e => setForm({ ...form, restaurantName: e.target.value })} style={styles.select} required>
              <option value="">Select Restaurant</option>
              {restaurants.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          )}
          
          <button type="submit" style={styles.button}>Create User & Assign Access</button>
        </form>
        {message && <div style={{ marginTop: '10px', padding: '10px', background: '#10B981', borderRadius: '8px', color: 'white' }}>{message}</div>}
      </div>

      {/* Restaurants List */}
      <div style={styles.card}>
        <h2 style={styles.title}>🍽️ Fortune Hotels - Restaurants</h2>
        <table style={styles.table}>
          <thead><tr>{['Restaurant Name', 'Login ID', 'Password', 'Access'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {restaurants.map(r => (
              <tr key={r.id}>
                <td style={styles.td}>🍴 {r.name}</td>
                <td style={styles.td}>{r.email}</td>
                <td style={styles.td}>{r.password}</td>
                <td style={styles.td}>Redeem Vouchers, View Transactions</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Users List with Access Info */}
      <div style={styles.card}>
        <h2 style={styles.title}>📋 All Users & Their Access Rights</h2>
        <table style={styles.table}>
          <thead><tr>{['Email', 'Role', 'Restaurant', 'Access Rights', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>{u.restaurantName || '-'}</td>
                <td style={styles.td}>{getRoleAccess(u.role)}</td>
                <td style={styles.td}>{u.isActive ? '✅ Active' : '❌ Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Access Guide */}
      <div style={styles.card}>
        <h2 style={styles.title}>📖 Role-Based Access Guide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div style={{ background: '#0F172A', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#F59E0B' }}>👑 Super Admin</h3>
            <p style={{ color: '#94A3B8' }}>• Create/Manage Users</p>
            <p style={{ color: '#94A3B8' }}>• Assign Roles & Access</p>
            <p style={{ color: '#94A3B8' }}>• Full System Control</p>
          </div>
          <div style={{ background: '#0F172A', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#F59E0B' }}>🎫 Front Office</h3>
            <p style={{ color: '#94A3B8' }}>• Create Vouchers Only</p>
            <p style={{ color: '#94A3B8' }}>• Generate QR Codes</p>
            <p style={{ color: '#94A3B8' }}>• Download PNG/PDF</p>
          </div>
          <div style={{ background: '#0F172A', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#F59E0B' }}>🍽️ Restaurant Manager</h3>
            <p style={{ color: '#94A3B8' }}>• Search Vouchers</p>
            <p style={{ color: '#94A3B8' }}>• Deduct Balance</p>
            <p style={{ color: '#94A3B8' }}>• Transaction History</p>
          </div>
          <div style={{ background: '#0F172A', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#F59E0B' }}>📊 Accounts</h3>
            <p style={{ color: '#94A3B8' }}>• View All Vouchers</p>
            <p style={{ color: '#94A3B8' }}>• Export Reports (Excel/PDF)</p>
            <p style={{ color: '#94A3B8' }}>• Print Reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;