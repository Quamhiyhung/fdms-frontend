import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const Assignments = () => {
  const [funerals, setFunerals] = useState([]);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [admins, setAdmins] = useState([]);
  const [tellers, setTellers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('funeral_admin');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchFunerals(); fetchAdmins(); fetchTellers(); }, []);

  const fetchFunerals = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/funerals/all', { headers: { authorization: token } });
      setFunerals(res.data.funerals);
    } catch (error) {
      toast.error('Failed to load funerals');
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/funerals/users/2', { headers: { authorization: token } });
      setAdmins(res.data.users);
    } catch (error) {
      toast.error('Failed to load admins');
    }
  };

  const fetchTellers = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/funerals/users/3', { headers: { authorization: token } });
      setTellers(res.data.users);
    } catch (error) {
      toast.error('Failed to load tellers');
    }
  };

  const fetchAssignments = async (funeral_id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/funerals/${funeral_id}/assignments`, { headers: { authorization: token } });
      setAssignments(res.data.assignments);
    } catch (error) {
      toast.error('Failed to load assignments');
    }
  };

  const handleFuneralChange = (e) => {
    setSelectedFuneral(e.target.value);
    if (e.target.value) fetchAssignments(e.target.value);
  };

  const handleAssign = async () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    try {
      await axios.post('${API_BASE}/api/funerals/assign',
        { funeral_id: selectedFuneral, user_id: selectedUser, assigned_role: selectedRole },
        { headers: { authorization: token } }
      );
      toast.success('User assigned successfully!');
      setSelectedUser('');
      fetchAssignments(selectedFuneral);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign user');
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/funerals/assignments/${id}`, { headers: { authorization: token } });
      toast.success('Assignment removed');
      fetchAssignments(selectedFuneral);
    } catch (error) {
      toast.error('Failed to remove assignment');
    }
  };

  const userList = selectedRole === 'funeral_admin' ? admins : tellers;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Assign Admins & Tellers</h1>

        <div style={styles.card}>
          <label style={styles.label}>Select Funeral</label>
          <select style={styles.input} value={selectedFuneral} onChange={handleFuneralChange}>
            <option value="">-- Select Funeral --</option>
            {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name} ({f.funeral_id})</option>)}
          </select>
        </div>

        {selectedFuneral && (
          <>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Assign User</h3>
              <div style={styles.assignForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Role</label>
                  <select style={styles.input} value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setSelectedUser(''); }}>
                    <option value="funeral_admin">Funeral Admin</option>
                    <option value="teller">Teller</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select {selectedRole === 'funeral_admin' ? 'Admin' : 'Teller'}</label>
                  <select style={styles.input} value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                    <option value="">-- Select User --</option>
                    {userList.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                  </select>
                </div>
                <button style={styles.btn} onClick={handleAssign}>+ Assign</button>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Current Assignments ({assignments.length})</h3>
              {assignments.map(a => (
                <div key={a.id} style={styles.assignmentRow}>
                  <div>
                    <p style={styles.assignmentName}>{a.full_name}</p>
                    <p style={styles.assignmentInfo}>{a.email} &middot; <span style={styles.roleTag}>{a.assigned_role === 'funeral_admin' ? 'Funeral Admin' : 'Teller'}</span></p>
                  </div>
                  <button style={styles.removeBtn} onClick={() => handleRemove(a.id)}>Remove</button>
                </div>
              ))}
              {assignments.length === 0 && <p style={styles.empty}>No users assigned to this funeral yet</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1a3c5e', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%' },
  assignForm: { display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '16px', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  btn: { padding: '10px 24px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', height: '42px' },
  assignmentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' },
  assignmentName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  assignmentInfo: { fontSize: '12px', color: '#888', marginTop: '4px' },
  roleTag: { background: '#e8f0fe', color: '#2d6a9f', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' },
  removeBtn: { padding: '8px 16px', background: '#fde8e8', border: '1px solid #dc3545', borderRadius: '6px', color: '#dc3545', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  empty: { color: '#aaa', fontSize: '14px' },
};

export default Assignments;