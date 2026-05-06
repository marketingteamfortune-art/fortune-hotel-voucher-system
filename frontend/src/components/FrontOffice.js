import React, { useState } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const styles = {
  container: { padding: '20px' },
  card: { background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' },
  title: { color: '#F59E0B', marginBottom: '15px' },
  formGroup: { marginBottom: '15px' },
  label: { color: '#FBBF24', display: 'block', marginBottom: '5px' },
  input: { width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white' },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  voucherCard: { background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', padding: '20px', borderRadius: '12px', textAlign: 'center' },
  voucherText: { color: '#78350F' },
  downloadBtn: { background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', margin: '5px', cursor: 'pointer' }
};

const FrontOffice = ({ token }) => {
  const [form, setForm] = useState({ guestName: '', ConfirmationNumber: '', RoomNumber: '', Amount: '100', ExpiryDate: '' });
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createVoucher = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/vouchers', form, { headers: { Authorization: `Bearer ${token}` } });
      setVoucher(response.data);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPNG = async () => {
    const element = document.getElementById('voucher-card');
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `voucher-${voucher.serialNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById('voucher-card');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`voucher-${voucher.serialNumber}.pdf`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Voucher</h2>
        <form onSubmit={createVoucher}>
          <div style={styles.formGroup}><label style={styles.label}>Guest Name</label><input type="text" name="guestName" value={form.guestName} onChange={handleChange} style={styles.input} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Passport/EID</label><input type="text" name="passportEID" value={form.passportEID} onChange={handleChange} style={styles.input} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Room Number</label><input type="text" name="roomNumber" value={form.roomNumber} onChange={handleChange} style={styles.input} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Amount (AED)</label><select name="amount" value={form.amount} onChange={handleChange} style={styles.select}><option value="100">100</option><option value="500">500</option><option value="1000">1,000</option><option value="2000">2,000</option><option value="5000">5,000</option></select></div>
          <div style={styles.formGroup}><label style={styles.label}>Expiry Date</label><input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} style={styles.input} required /></div>
          <button type="submit" disabled={loading} style={styles.button}>{loading ? 'Creating...' : 'Create Voucher'}</button>
        </form>
      </div>

      {voucher && (
        <div style={styles.card}>
          <h2 style={styles.title}>Voucher Preview</h2>
          <div id="voucher-card" style={styles.voucherCard}>
            <h2 style={styles.voucherText}>🏨 Grand Luxury Hotel</h2>
            <p style={styles.voucherText}>Dining Voucher</p>
            <hr />
            <p><strong>Serial:</strong> {voucher.serialNumber}</p>
            <p><strong>Guest:</strong> {voucher.guestName}</p>
            <p><strong>Room:</strong> {voucher.roomNumber}</p>
            <p><strong>Amount:</strong> AED {voucher.totalAmount}</p>
            <p><strong>Expiry:</strong> {new Date(voucher.expiryDate).toLocaleDateString()}</p>
            {voucher.qrCode && <img src={voucher.qrCode} alt="QR" style={{ width: '100px', marginTop: '10px' }} />}
          </div>
          <div style={{ marginTop: '15px' }}><button onClick={downloadAsPNG} style={styles.downloadBtn}>Download PNG</button><button onClick={downloadAsPDF} style={styles.downloadBtn}>Download PDF</button></div>
        </div>
      )}
    </div>
  );
};

export default FrontOffice;