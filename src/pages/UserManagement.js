import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role_id: '2' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/auth/users', { headers: { authorization: token } });
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('${API_BASE}/api/auth/register', form, { headers: { authorization: token } });
      toast.success('User created successfully!');
      setForm({ full_name: '', email: '', password: '', role_id: '2' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ full_name: u.full_name, email: u.email, role_id: u.role_id });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_BASE}/api/auth/users/${editingId}/edit`, editForm, { headers: { authorization: token } });
      toast.success('User updated successfully!');
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await axios.delete(`${API_BASE}/api/auth/users/${id}/delete`, { headers: { authorization: token } });
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await axios.put(`${API_BASE}/api/auth/users/${id}/toggle-active`, {}, { headers: { authorization: token } });
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/auth/users/${passwordTarget}/change-password`, { new_password: newPassword }, { headers: { authorization: token } });
      toast.success('Password updated successfully!');
      setPasswordTarget(null);
      setNewPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const roleLabel = (role_id) => role_id === 1 ? 'Super Admin' : role_id === 2 ? 'Funeral Admin' : 'Teller';

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>User Management</h1>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Create New User</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input type="email" style={styles.input} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" style={styles.input} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select style={styles.input} value={form.role_id} onChange={(e) => setForm({...form, role_id: e.target.value})}>
                <option value="2">Funeral Admin</option>
                <option value="3">Teller</option>
              </select>
            </div>
            <button type="submit" style={styles.btn}>Create User</button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>All Users</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                editingId === u.id ? (
                  <tr key={u.id} style={styles.editRow}>
                    <td style={styles.td}><input style={styles.editInput} value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} /></td>
                    <td style={styles.td}><input style={styles.editInput} value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} /></td>
                    <td style={styles.td}>
                      <select style={styles.editInput} value={editForm.role_id} onChange={(e) => setEditForm({...editForm, role_id: e.target.value})}>
                        <option value="1">Super Admin</option>
                        <option value="2">Funeral Admin</option>
                        <option value="3">Teller</option>
                      </select>
                    </td>
                    <td style={styles.td}>{u.is_active ? 'Active' : 'Inactive'}</td>
                    <td style={styles.td}>
                      <button style={styles.saveBtn} onClick={saveEdit}>Save</button>
                      <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.full_name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{roleLabel(u.role_id)}</td>
                    <td style={styles.td}>
                      <span style={{...styles.statusBadge, background: u.is_active ? '#28a745' : '#dc3545'}}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => startEdit(u)}>✏️ Edit</button>
                      <button style={styles.toggleBtn} onClick={() => handleToggleActive(u.id)}>
                        {u.is_active ? '🔒 Deactivate' : '🔓 Activate'}
                      </button>
                      <button style={styles.passwordBtn} onClick={() => setPasswordTarget(u.id)}>🔑 Password</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(u.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {passwordTarget && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Change User Password</h3>
              <input
                type="password"
                style={styles.modalInput}
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div style={styles.modalActions}>
                <button style={styles.modalCancelBtn} onClick={() => { setPasswordTarget(null); setNewPassword(''); }}>Cancel</button>
                <button style={styles.modalSaveBtn} onClick={handleChangePassword}>Update Password</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflowX: 'auto' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1a3c5e', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  btn: { padding: '12px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
  statusBadge: { padding: '4px 10px', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: '600' },
  editRow: { background: '#fff8e1' },
  editInput: { padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px', width: '120px' },
  editBtn: { padding: '6px 10px', background: '#e8f0fe', border: '1px solid #2d6a9f', borderRadius: '6px', color: '#2d6a9f', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  toggleBtn: { padding: '6px 10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', color: '#856404', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  passwordBtn: { padding: '6px 10px', background: '#e0f7fa', border: '1px solid #00838f', borderRadius: '6px', color: '#00838f', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  deleteBtn: { padding: '6px 10px', background: '#fde8e8', border: '1px solid #dc3545', borderRadius: '6px', color: '#dc3545', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { padding: '6px 10px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  cancelBtn: { padding: '6px 10px', background: '#6c757d', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '10px', padding: '24px', width: '380px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#1a3c5e', marginBottom: '16px' },
  modalInput: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  modalCancelBtn: { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  modalSaveBtn: { padding: '10px 20px', background: '#1a3c5e', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

export default UserManagement;