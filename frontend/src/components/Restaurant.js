import React, { useState } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px' },
  card: { background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' },
  title: { color: '#F59E0B', marginBottom: '15px' },
  input: { padding: '10px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', flex: 1 },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  searchBox: { display: 'flex', gap: '10px', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155' },
  balance: { fontSize: '24px', fontWeight: 'bold', color: '#10B981' },
  transactionItem: { background: '#0F172A', padding: '10px', borderRadius: '8px', marginBottom: '10px' }
};

const RestaurantModule = ({ token, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [invoice, setInvoice] = useState('');

  const searchVoucher = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/vouchers/search?query=${searchQuery}`, { headers: { Authorization: `Bearer ${token}` } });
      setVoucher(response.data);
      const transRes = await axios.get(`http://localhost:5000/api/transactions/voucher/${response.data._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTransactions(transRes.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Not found');
      setVoucher(null);
    }
  };

  const redeemVoucher = async () => {
    if (!amount || !invoice) return alert('Enter amount and invoice number');
    if (parseFloat(amount) > voucher.balanceAmount) return alert('Insufficient balance');
    try {
      const response = await axios.post(`http://localhost:5000/api/vouchers/redeem/${voucher._id}`, { amount: parseFloat(amount), invoiceNumber: invoice }, { headers: { Authorization: `Bearer ${token}` } });
      setVoucher(response.data.voucher);
      setTransactions([response.data.transaction, ...transactions]);
      setAmount('');
      setInvoice('');
      alert('Amount deducted successfully!');
    } catch (error) {
      alert(error.response?.data?.error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🍽️ Restaurant Module</h2>
        <div style={styles.searchBox}>
          <input type="text" placeholder="Search by Serial / Room / Passport" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={styles.input} />
          <button onClick={searchVoucher} style={styles.button}>Search</button>
        </div>
      </div>

      {voucher && (
        <>
          <div style={styles.card}>
            <h3 style={styles.title}>Voucher Details</h3>
            <div style={styles.infoRow}><span>Serial Number:</span><span>{voucher.serialNumber}</span></div>
            <div style={styles.infoRow}><span>Guest Name:</span><span>{voucher.guestName}</span></div>
            <div style={styles.infoRow}><span>Room Number:</span><span>{voucher.roomNumber}</span></div>
            <div style={styles.infoRow}><span>Total Amount:</span><span>AED {voucher.totalAmount}</span></div>
            <div style={styles.infoRow}><span>Spent Amount:</span><span>AED {voucher.spentAmount}</span></div>
            <div style={styles.infoRow}><span>Remaining Balance:</span><span style={styles.balance}>AED {voucher.balanceAmount}</span></div>
            <div style={styles.infoRow}><span>Expiry Date:</span><span>{new Date(voucher.expiryDate).toLocaleDateString()}</span></div>
          </div>

          {voucher.balanceAmount > 0 && new Date() <= new Date(voucher.expiryDate) && (
            <div style={styles.card}>
              <h3 style={styles.title}>Deduct Amount</h3>
              <input type="number" placeholder="Amount (AED)" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...styles.input, width: '100%', marginBottom: '10px' }} />
              <input type="text" placeholder="Invoice Number" value={invoice} onChange={e => setInvoice(e.target.value)} style={{ ...styles.input, width: '100%', marginBottom: '10px' }} />
              <button onClick={redeemVoucher} style={styles.button}>Deduct Amount</button>
            </div>
          )}

          {transactions.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.title}>Transaction History</h3>
              {transactions.map(t => (
                <div key={t._id} style={styles.transactionItem}>
                  <div><strong>Amount:</strong> -AED {t.amount}</div>
                  <div><strong>Invoice:</strong> {t.invoiceNumber}</div>
                  <div><strong>Remaining:</strong> AED {t.remainingBalance}</div>
                  <div><small>{new Date(t.createdAt).toLocaleString()}</small></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantModule;