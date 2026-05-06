import React, { useState } from 'react';
import axios from 'axios';

const styles = {
  container: { padding: '20px' },
  card: { background: '#1E293B', padding: '25px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #334155' },
  title: { color: '#F59E0B', marginBottom: '20px', fontSize: '24px' },
  formGroup: { marginBottom: '15px' },
  label: { color: '#FBBF24', display: 'block', marginBottom: '8px', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', fontSize: '14px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px', background: '#0F172A', border: '1px solid #F59E0B', borderRadius: '8px', color: 'white', fontSize: '14px' },
  button: { background: '#F59E0B', color: '#020617', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
  buttonSecondary: { background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', marginLeft: '10px' },
  taskList: { background: '#0F172A', padding: '15px', borderRadius: '8px', marginTop: '15px' },
  taskItem: { display: 'flex', alignItems: 'center', padding: '10px', margin: '8px 0', background: '#1E293B', borderRadius: '8px', cursor: 'pointer', border: '1px solid #334155' },
  taskSelected: { border: '2px solid #F59E0B', background: '#2D3A5E' },
  generatedIdCard: { background: 'linear-gradient(135deg, #1E293B, #0F172A)', padding: '20px', borderRadius: '12px', border: '2px solid #F59E0B', marginTop: '20px' },
  idInfo: { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #334155' },
  copyBtn: { background: '#3B82F6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginLeft: '10px' }
};

const CreateID = ({ token }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    restaurantName: '',
    tasks: []
  });
  const [generatedUser, setGeneratedUser] = useState(null);
  const [message, setMessage] = useState('');

  // Task options based on role
  const taskOptions = {
    accounts: [
      { id: 'view_reports', name: '📊 View All Reports', description: 'Can view all voucher reports' },
      { id: 'export_excel', name: '📎 Export to Excel', description: 'Can export reports to Excel' },
      { id: 'export_pdf', name: '📄 Export to PDF', description: 'Can export reports to PDF' },
      { id: 'print_reports', name: '🖨️ Print Reports', description: 'Can print reports' }
    ],
    front_office: [
      { id: 'create_voucher', name: '🎫 Create Vouchers', description: 'Can create new vouchers' },
      { id: 'generate_qr', name: '📱 Generate QR Code', description: 'Can generate QR for vouchers' },
      { id: 'download_png', name: '💾 Download PNG', description: 'Can download voucher as PNG' },
      { id: 'download_pdf', name: '📑 Download PDF', description: 'Can download voucher as PDF' }
    ],
    restaurant_manager: [
      { id: 'search_voucher', name: '🔍 Search Vouchers', description: 'Can search vouchers' },
      { id: 'redeem_voucher', name: '💰 Redeem Vouchers', description: 'Can deduct balance' },
      { id: 'view_history', name: '📜 View Transaction History', description: 'Can view transaction history' }
    ]
  };

  const restaurantList = [
    { id: 1, name: 'Freddys' },
    { id: 2, name: 'Rasa Costal Vibes' },
    { id: 3, name: 'Desi Dhaba' },
    { id: 4, name: 'Ascent Rooftop' },
    { id: 5, name: 'Room Service' }
  ];

  const handleTaskToggle = (taskId) => {
    if (formData.tasks.includes(taskId)) {
      setFormData({ ...formData, tasks: formData.tasks.filter(t => t !== taskId) });
    } else {
      setFormData({ ...formData, tasks: [...formData.tasks, taskId] });
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateLoginId = () => {
    const prefix = formData.role === 'accounts' ? 'ACC' : formData.role === 'front_office' ? 'FO' : 'REST';
    const randomNum = Math.floor(Math.random() * 10000);
    const restaurantCode = formData.restaurantName ? formData.restaurantName.substring(0, 3).toUpperCase() : '';
    return `${prefix}${restaurantCode}${randomNum}`;
  };

  const createID = async () => {
    if (!formData.name || !formData.role) {
      setMessage('❌ Please fill all required fields');
      return;
    }

    const loginId = generateLoginId();
    const password = generateRandomPassword();
    const email = `${loginId.toLowerCase()}@fortune.com`;

    const newUser = {
      email: email,
      password: password,
      role: formData.role,
      restaurantName: formData.role === 'restaurant_manager' ? formData.restaurantName : undefined,
      tasks: formData.tasks,
      loginId: loginId,
      name: formData.name
    };

    try {
      const response = await axios.post('http://localhost:5000/api/users', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGeneratedUser({
        ...newUser,
        id: response.data.user?._id || Date.now()
      });
      setMessage('✅ ID Created Successfully!');
      setStep(3);
    } catch (error) {
      setMessage('❌ Error creating ID: ' + (error.response?.data?.error || error.message));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', restaurantName: '', tasks: [] });
    setGeneratedUser(null);
    setStep(1);
    setMessage('');
  };

  return (
    <div style={styles.container}>
      {/* Step 1: Select Role & Name */}
      {step === 1 && (
        <div style={styles.card}>
          <h2 style={styles.title}>👤 Create New ID - Step 1</h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Enter person's full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value, tasks: [], restaurantName: '' })}
              style={styles.select}
            >
              <option value="">-- Select Role --</option>
              <option value="accounts">📊 Accounts Department</option>
              <option value="front_office">🎫 Front Office Staff</option>
              <option value="restaurant_manager">🍽️ Restaurant Manager</option>
            </select>
          </div>

          {formData.role === 'restaurant_manager' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Restaurant</label>
              <select
                value={formData.restaurantName}
                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                style={styles.select}
              >
                <option value="">-- Select Restaurant --</option>
                {restaurantList.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
          )}

          <button onClick={() => setStep(2)} style={styles.button} disabled={!formData.name || !formData.role}>
            Next → Assign Tasks
          </button>
        </div>
      )}

      {/* Step 2: Assign Tasks */}
      {step === 2 && (
        <div style={styles.card}>
          <h2 style={styles.title}>📋 Assign Tasks - Step 2</h2>
          <p style={{ color: '#94A3B8', marginBottom: '20px' }}>
            Role: <strong style={{ color: '#F59E0B' }}>{formData.role}</strong>
            {formData.restaurantName && ` | Restaurant: ${formData.restaurantName}`}
          </p>

          <div style={styles.taskList}>
            <h3 style={{ color: '#FBBF24', marginBottom: '15px' }}>Select Access Permissions:</h3>
            {taskOptions[formData.role]?.map(task => (
              <div
                key={task.id}
                onClick={() => handleTaskToggle(task.id)}
                style={{
                  ...styles.taskItem,
                  ...(formData.tasks.includes(task.id) ? styles.taskSelected : {})
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: 'white' }}>{task.name}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{task.description}</div>
                </div>
                <div style={{ fontSize: '20px' }}>
                  {formData.tasks.includes(task.id) ? '✅' : '⬜'}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setStep(1)} style={{ ...styles.button, background: '#64748B' }}>← Back</button>
            <button onClick={createID} style={styles.button}>Generate ID & Password →</button>
          </div>
        </div>
      )}

      {/* Step 3: Generated ID Card */}
      {step === 3 && generatedUser && (
        <div style={styles.card}>
          <h2 style={styles.title}>🎉 ID Generated Successfully!</h2>
          
          <div style={styles.generatedIdCard}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#F59E0B' }}>🏨 Fortune Hotels</h2>
              <p>Employee Access ID Card</p>
            </div>
            
            <div style={styles.idInfo}>
              <span style={{ color: '#94A3B8' }}>Name:</span>
              <span style={{ color: 'white', fontWeight: 'bold' }}>{generatedUser.name}</span>
            </div>
            <div style={styles.idInfo}>
              <span style={{ color: '#94A3B8' }}>Login ID:</span>
              <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{generatedUser.loginId}</span>
              <button onClick={() => copyToClipboard(generatedUser.loginId)} style={styles.copyBtn}>Copy</button>
            </div>
            <div style={styles.idInfo}>
              <span style={{ color: '#94A3B8' }}>Email:</span>
              <span style={{ color: 'white' }}>{generatedUser.email}</span>
              <button onClick={() => copyToClipboard(generatedUser.email)} style={styles.copyBtn}>Copy</button>
            </div>
            <div style={styles.idInfo}>
              <span style={{ color: '#94A3B8' }}>Password:</span>
              <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{generatedUser.password}</span>
              <button onClick={() => copyToClipboard(generatedUser.password)} style={styles.copyBtn}>Copy</button>
            </div>
            <div style={styles.idInfo}>
              <span style={{ color: '#94A3B8' }}>Role:</span>
              <span style={{ color: 'white' }}>{generatedUser.role}</span>
            </div>
            {generatedUser.restaurantName && (
              <div style={styles.idInfo}>
                <span style={{ color: '#94A3B8' }}>Restaurant:</span>
                <span style={{ color: 'white' }}>{generatedUser.restaurantName}</span>
              </div>
            )}
            <div style={styles.idInfo}>
              <span style={{ color: '#94A3B8' }}>Assigned Tasks:</span>
              <span style={{ color: '#10B981' }}>{generatedUser.tasks?.length || 0} permissions</span>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8' }}>⚠️ Save these credentials and share with the user</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => window.print()} style={{ ...styles.buttonSecondary, background: '#3B82F6' }}>🖨️ Print ID Card</button>
              <button onClick={resetForm} style={{ ...styles.button, background: '#10B981', color: 'white' }}>➕ Create Another ID</button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div style={{
          padding: '12px',
          background: message.includes('✅') ? '#10B981' : '#EF4444',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          marginTop: '15px'
        }}>
          {message}
        </div>
      )}

      {/* Display existing users */}
      <div style={styles.card}>
        <h2 style={styles.title}>📋 Existing Users & Their Access</h2>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0F172A' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#FBBF24' }}>Name/ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#FBBF24' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#FBBF24' }}>Assigned Tasks</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#FBBF24' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #334155', color: 'white' }}>admin@grandluxury.com</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #334155', color: '#F59E0B' }}>Super Admin</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #334155', color: '#94A3B8' }}>All Access</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #334155', color: '#10B981' }}>✅ Active</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreateID;