import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const styles = {
  container: { padding: '20px' },
  card: { background: '#1E293B', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' },
  title: { color: '#F59E0B', marginBottom: '15px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', background: '#0F172A', color: '#FBBF24', borderBottom: '1px solid #F59E0B' },
  td: { padding: '12px', borderBottom: '1px solid #334155', color: 'white' },
  statusActive: { background: '#10B981', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
  statusExpired: { background: '#EF4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '8px 16px', borderRadius: '8px', marginRight: '10px', cursor: 'pointer' }
};

const AccountsModule = ({ token }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vouchers', { headers: { Authorization: `Bearer ${token}` } });
      setVouchers(response.data);
    } catch (error) {
      alert('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = vouchers.map(v => ({
      'Serial Number': v.serialNumber,
      'Guest Name': v.guestName,
      'Room Number': v.roomNumber,
      'Total Amount': v.totalAmount,
      'Spent Amount': v.spentAmount,
      'Balance Amount': v.balanceAmount,
      'Status': v.status,
      'Issue Date': new Date(v.createdAt).toLocaleDateString(),
      'Expiry Date': new Date(v.expiryDate).toLocaleDateString()
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vouchers');
    XLSX.writeFile(wb, `vouchers-report-${new Date().toISOString()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Vouchers Report', 14, 15);
    const tableData = vouchers.map(v => [v.serialNumber, v.guestName, v.roomNumber, v.totalAmount, v.spentAmount, v.balanceAmount, v.status, new Date(v.createdAt).toLocaleDateString()]);
    doc.autoTable({ head: [['Serial', 'Guest', 'Room', 'Total', 'Spent', 'Balance', 'Status', 'Issue Date']], body: tableData, startY: 20 });
    doc.save(`vouchers-${new Date().toISOString()}.pdf`);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Vouchers Report</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}</style>
      </head><body><h1>Vouchers Report - ${new Date().toLocaleDateString()}</h1>
      <table><thead><tr><th>Serial</th><th>Guest</th><th>Room</th><th>Total</th><th>Spent</th><th>Balance</th><th>Status</th><th>Issue Date</th></tr></thead><tbody>
      ${vouchers.map(v => `<tr><td>${v.serialNumber}</td><td>${v.guestName}</td><td>${v.roomNumber}</td><td>${v.totalAmount}</td><td>${v.spentAmount}</td><td>${v.balanceAmount}</td><td>${v.status}</td><td>${new Date(v.createdAt).toLocaleDateString()}</td></tr>`).join('')}
      </tbody></table></body></html>
    `);
    printWindow.print();
  };

  const totalValue = vouchers.reduce((sum, v) => sum + v.totalAmount, 0);
  const totalSpent = vouchers.reduce((sum, v) => sum + v.spentAmount, 0);
  const totalBalance = vouchers.reduce((sum, v) => sum + v.balanceAmount, 0);

  if (loading) return <div style={styles.container}><p style={{ color: 'white' }}>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={styles.card}><h3 style={{ color: '#94A3B8' }}>Total Value</h3><p style={{ fontSize: '28px', color: '#F59E0B' }}>AED {totalValue.toLocaleString()}</p></div>
        <div style={styles.card}><h3 style={{ color: '#94A3B8' }}>Total Spent</h3><p style={{ fontSize: '28px', color: '#FBBF24' }}>AED {totalSpent.toLocaleString()}</p></div>
        <div style={styles.card}><h3 style={{ color: '#94A3B8' }}>Remaining Balance</h3><p style={{ fontSize: '28px', color: '#10B981' }}>AED {totalBalance.toLocaleString()}</p></div>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={styles.title}>📊 Vouchers Report</h2>
          <div><button onClick={exportToExcel} style={styles.button}>Export Excel</button><button onClick={exportToPDF} style={styles.button}>Export PDF</button><button onClick={printReport} style={styles.button}>Print</button></div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead><tr>{['Serial', 'Guest', 'Room', 'Total', 'Spent', 'Balance', 'Status', 'Issue Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {vouchers.map(v => (<tr key={v._id}><td style={styles.td}>{v.serialNumber}</td><td style={styles.td}>{v.guestName}</td><td style={styles.td}>{v.roomNumber}</td><td style={styles.td}>AED {v.totalAmount}</td><td style={styles.td}>AED {v.spentAmount}</td><td style={styles.td}>AED {v.balanceAmount}</td><td style={styles.td}><span style={v.status === 'active' ? styles.statusActive : styles.statusExpired}>{v.status}</span></td><td style={styles.td}>{new Date(v.createdAt).toLocaleDateString()}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountsModule;