import React, { useState } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const ChangePassword = () => {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/auth/change-password`,
        { current_password: form.current_password, new_password: form.new_password },
        { headers: { authorization: token } }
      );
      toast.success('Password changed successfully!');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Change Password</h1>
        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password</label>
              <input type="password" style={styles.input} value={form.current_password} onChange={(e) => setForm({...form, current_password: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input type="password" style={styles.input} value={form.new_password} onChange={(e) => setForm({...form, new_password: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input type="password" style={styles.input} value={form.confirm_password} onChange={(e) => setForm({...form, confirm_password: e.target.value})} required />
            </div>
            <button type="submit" style={styles.btn}>Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', maxWidth: '450px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  btn: { padding: '12px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
};

export default ChangePassword;