import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px' },
  card: { background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' },
  title: { color: '#F59E0B', marginBottom: '15px' },
  input: { width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', marginBottom: '10px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', marginBottom: '10px' },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', background: '#0F172A', color: '#FBBF24' },
  td: { padding: '12px', borderBottom: '1px solid #334155', color: 'white' }
};

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const restaurants = [
    { id: 1, name: "Freddy's", subdomain: 'freddys', email: 'freddys@fortune.com', password: 'Freddys@123' },
    { id: 2, name: 'Rasa Coastal Vibes', subdomain: 'rasa', email: 'rasa@fortune.com', password: 'Rasa@123' },
    { id: 3, name: 'Desi Dhaba', subdomain: 'desi', email: 'desi@fortune.com', password: 'Desi@123' },
    { id: 4, name: 'Ascent Rooftop', subdomain: 'ascent', email: 'ascent@fortune.com', password: 'Ascent@123' }
  ];
  const [form, setForm] = useState({ email: '', password: '', role: '', restaurantName: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
  fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ User created successfully!');
      fetchUsers();
      setForm({ email: '', password: '', role: '', restaurantName: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error creating user');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👥 Create New User</h2>
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
          <button type="submit" style={styles.button}>Create User</button>
        </form>
        {message && <div style={{ marginTop: '10px', padding: '10px', background: '#10B981', borderRadius: '8px', color: 'white' }}>{message}</div>}
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>📋 All Users</h2>
        <table style={styles.table}>
          <thead><tr>{['Email', 'Role', 'Restaurant', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>{u.restaurantName || '-'}</td>
                <td style={styles.td}>{u.isActive ? '✅ Active' : '❌ Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;