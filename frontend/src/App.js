import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FrontOffice from './components/FrontOffice';
import RestaurantModule from './components/Restaurant';
import AccountsModule from './components/Accounts';
import UserManagement from './components/UserManagement';
import QRScanner from './components/QRScanner';
import CreateID from './components/CreateID';

// Styles
const styles = {
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  loginBox: {
    background: '#1E293B',
    padding: '40px',
    borderRadius: '16px',
    width: '400px',
    border: '2px solid #F59E0B',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
  },
  heading: {
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: '30px'
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#0F172A',
    border: '1px solid #F59E0B',
    borderRadius: '8px',
    color: 'white',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#F59E0B',
    border: 'none',
    borderRadius: '8px',
    color: '#020617',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer'
  },
  header: {
    background: '#0F172A',
    padding: '20px',
    borderBottom: '2px solid #F59E0B',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#F59E0B',
    margin: 0
  },
  headerSub: {
    color: '#94A3B8',
    margin: 0,
    fontSize: '12px'
  },
  logoutBtn: {
    background: '#EF4444',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  nav: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    background: '#0F172A',
    borderBottom: '1px solid #334155',
    flexWrap: 'wrap'
  },
  navBtn: {
    padding: '10px 20px',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#94A3B8',
    cursor: 'pointer'
  },
  activeNavBtn: {
    background: '#F59E0B',
    color: '#020617',
    border: 'none'
  },
  content: {
    padding: '20px'
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [activeModule, setActiveModule] = useState('createid');
  const [formData, setFormData] = useState({ subdomain: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsLoggedIn(true);
        setMessage('✅ Login successful!');
      }
    } catch (error) {
      setMessage('❌ Login failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setToken('');
    setActiveModule('createid');
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h1 style={styles.heading}>🏨 Fortune Hotels</h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <input type="text" placeholder="Subdomain (fortune)" value={formData.subdomain} onChange={e => setFormData({ ...formData, subdomain: e.target.value })} style={styles.input} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={styles.input} required />
            </div>
            <button type="submit" style={styles.button}>Login</button>
          </form>
          {message && <div style={{ marginTop: '20px', padding: '10px', background: message.includes('✅') ? '#10B981' : '#EF4444', borderRadius: '8px', textAlign: 'center', color: 'white' }}>{message}</div>}
        </div>
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'front_office': return <FrontOffice token={token} />;
      case 'restaurant_manager': return <RestaurantModule token={token} user={user} />;
      case 'accounts': return <AccountsModule token={token} />;
      case 'super_admin': return (
        <>
          {activeModule === 'createid' && <CreateID token={token} />}
          {activeModule === 'users' && <UserManagement token={token} />}
          {activeModule === 'vouchers' && <FrontOffice token={token} />}
          {activeModule === 'restaurant' && <RestaurantModule token={token} user={user} />}
          {activeModule === 'accounts' && <AccountsModule token={token} />}
          {activeModule === 'qrscanner' && <QRScanner />}
        </>
      );
      default: return <FrontOffice token={token} />;
    }
  };

  // Modules for Super Admin
  const superAdminModules = [
    { id: 'createid', name: '🆔 Create ID', roles: ['super_admin'] },
    { id: 'users', name: '👥 User Management', roles: ['super_admin'] },
    { id: 'vouchers', name: '🎫 Create Voucher', roles: ['front_office', 'super_admin'] },
    { id: 'restaurant', name: '🍽️ Restaurant Module', roles: ['restaurant_manager', 'super_admin'] },
    { id: 'accounts', name: '📊 Accounts', roles: ['accounts', 'super_admin'] },
    { id: 'qrscanner', name: '📱 QR Scanner', roles: ['super_admin'] }
  ];

  // Modules for other roles
  const regularModules = [
    { id: 'vouchers', name: '🎫 Create Voucher', roles: ['front_office'] },
    { id: 'restaurant', name: '🍽️ Restaurant Module', roles: ['restaurant_manager'] },
    { id: 'accounts', name: '📊 Accounts', roles: ['accounts'] }
  ];

  // Super Admin View
  if (user?.role === 'super_admin') {
    const visibleModules = superAdminModules.filter(m => m.roles.includes(user.role));
    return (
      <div>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>🏨 Fortune Hotels</h1>
            <p style={styles.headerSub}>Voucher Management System - Super Admin Dashboard</p>
          </div>
          <div>
            <span style={{ color: '#FBBF24', marginRight: '20px' }}>👑 {user?.email}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
        <div style={styles.nav}>
          {visibleModules.map(m => (
            <button 
              key={m.id} 
              onClick={() => setActiveModule(m.id)} 
              style={{ ...styles.navBtn, ...(activeModule === m.id ? styles.activeNavBtn : {}) }}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div style={styles.content}>
          {activeModule === 'createid' && <CreateID token={token} />}
          {activeModule === 'users' && <UserManagement token={token} />}
          {activeModule === 'vouchers' && <FrontOffice token={token} />}
          {activeModule === 'restaurant' && <RestaurantModule token={token} user={user} />}
          {activeModule === 'accounts' && <AccountsModule token={token} />}
          {activeModule === 'qrscanner' && <QRScanner />}
        </div>
      </div>
    );
  }

  // Regular User View (Front Office, Restaurant, Accounts)
  const visibleModules = regularModules.filter(m => m.roles.includes(user?.role));
  
  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>🏨 Fortune Hotels</h1>
          <p style={styles.headerSub}>Voucher Management System</p>
        </div>
        <div>
          <span style={{ color: '#FBBF24', marginRight: '20px' }}>
            {user?.role === 'front_office' && '🎫 '}
            {user?.role === 'restaurant_manager' && '🍽️ '}
            {user?.role === 'accounts' && '📊 '}
            {user?.email}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
      {visibleModules.length > 1 && (
        <div style={styles.nav}>
          {visibleModules.map(m => (
            <button 
              key={m.id} 
              onClick={() => setActiveModule(m.id)} 
              style={{ ...styles.navBtn, ...(activeModule === m.id ? styles.activeNavBtn : {}) }}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}
      <div style={styles.content}>
        {user?.role === 'front_office' && <FrontOffice token={token} />}
        {user?.role === 'restaurant_manager' && <RestaurantModule token={token} user={user} />}
        {user?.role === 'accounts' && <AccountsModule token={token} />}
      </div>
    </div>
  );
}

export default App;