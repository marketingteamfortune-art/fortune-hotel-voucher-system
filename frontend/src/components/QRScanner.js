import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const styles = {
  container: { padding: '20px', maxWidth: '500px', margin: 'auto' },
  card: { background: '#1E293B', padding: '20px', borderRadius: '12px', border: '2px solid #F59E0B', textAlign: 'center' },
  voucherCard: { background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', padding: '20px', borderRadius: '12px', marginTop: '20px' },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }
};

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);

  // Simulate QR scan (in real scenario, use QR scanner library)
  const simulateQRScan = () => {
    const dummyVoucher = {
      serialNumber: 'FAH001',
      guestName: 'John Doe',
      confirmationNumber: 'CN123456',
      roomNumber: '501',
      amount: '500',
      expiryDate: '2026-12-31'
    };
    setScannedData(dummyVoucher);
  };

  const downloadVoucherToMobile = async () => {
    const element = document.getElementById('voucher-details');
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `voucher-${scannedData.serialNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: '#F59E0B' }}>📱 Scan QR Code</h2>
        <p style={{ color: '#94A3B8' }}>Scan the voucher QR code from your mobile</p>
        <button onClick={simulateQRScan} style={styles.button}>🔍 Simulate QR Scan</button>

        {scannedData && (
          <div id="voucher-details" style={styles.voucherCard}>
            <h2 style={{ color: '#78350F' }}>🏨 Fortune Hotels</h2>
            <h3 style={{ color: '#78350F' }}>Dining Voucher</h3>
            <hr />
            <p><strong>Serial:</strong> {scannedData.serialNumber}</p>
            <p><strong>Guest:</strong> {scannedData.guestName}</p>
            <p><strong>Confirmation:</strong> {scannedData.confirmationNumber}</p>
            <p><strong>Room:</strong> {scannedData.roomNumber}</p>
            <p><strong>Amount:</strong> AED {scannedData.amount}</p>
            <p><strong>Valid Till:</strong> {scannedData.expiryDate}</p>
            <div style={{ marginTop: '15px', padding: '10px', background: '#78350F', borderRadius: '8px' }}>
              <p style={{ color: '#FDE68A', margin: 0 }}>✓ Valid Voucher</p>
            </div>
          </div>
        )}

        {scannedData && (
          <button onClick={downloadVoucherToMobile} style={{ ...styles.button, marginTop: '20px', background: '#10B981', color: 'white' }}>
            💾 Save Voucher to Mobile
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;