import React from 'react';

function Dashboard({ onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#020617',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#0F172A',
        padding: '20px',
        borderBottom: '2px solid #F59E0B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: '#F59E0B', margin: 0 }}>🏨 Grand Luxury Hotel</h1>
          <p style={{ color: '#94A3B8', margin: 0 }}>Voucher Management System</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        padding: '30px'
      }}>
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94A3B8', margin: 0 }}>Total Vouchers</h3>
          <p style={{ color: '#F59E0B', fontSize: '32px', margin: '10px 0 0 0' }}>0</p>
        </div>
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94A3B8', margin: 0 }}>Total Value</h3>
          <p style={{ color: '#F59E0B', fontSize: '32px', margin: '10px 0 0 0' }}>AED 0</p>
        </div>
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94A3B8', margin: 0 }}>Active Vouchers</h3>
          <p style={{ color: '#10B981', fontSize: '32px', margin: '10px 0 0 0' }}>0</p>
        </div>
        <div style={{ background: '#1E293B', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#94A3B8', margin: 0 }}>Redemption Rate</h3>
          <p style={{ color: '#F59E0B', fontSize: '32px', margin: '10px 0 0 0' }}>0%</p>
        </div>
      </div>

      {/* Welcome Message */}
      <div style={{
        background: '#1E293B',
        margin: '0 30px',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #334155'
      }}>
        <h2 style={{ color: '#F59E0B' }}>Welcome to Hotel Voucher System! 🎉</h2>
        <p style={{ color: '#94A3B8', fontSize: '18px' }}>
          Your system is successfully running.<br/>
          Backend connected ✅ | Ready to create vouchers!
        </p>
      </div>
    </div>
  );
}

export default Dashboard;