import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import printReceipt from '../utils/printReceipt';

const TellerDashboard = () => {
  const [data, setData] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [orgName, setOrgName] = useState('FDMS');
  const [contactPhone, setContactPhone] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchDashboard(); fetchOrgName(); fetchContactPhone(); }, []);

  const fetchOrgName = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/settings/public/organization_name`, { headers: { authorization: token } });
      setOrgName(res.data.value);
    } catch (error) {}
  };

  const fetchContactPhone = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/settings/public/contact_phone`, { headers: { authorization: token } });
      setContactPhone(res.data.value);
    } catch (error) {}
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/dashboard/teller`, { headers: { authorization: token } });
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
  };

  const fetchRecipients = async (funeral_id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/donations/recipients/${funeral_id}`, { headers: { authorization: token } });
      setRecipients(res.data.recipients);
    } catch (error) {
      toast.error('Failed to load recipients');
    }
  };

  const startEdit = (d) => {
    setEditingId(d.id);
    setEditForm({
      donor_name: d.donor_name,
      phone_number: d.phone_number,
      amount: d.amount,
      recipient_id: d.recipient_id,
      payment_method: d.payment_method,
      notes: d.notes || ''
    });
    fetchRecipients(d.funeral_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const submitEditRequest = async (id) => {
    try {
      await axios.post(`${API_BASE}/api/donations/${id}/request-edit`, editForm, { headers: { authorization: token } });
      toast.success('Edit request submitted for approval!');
      setEditingId(null);
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit edit request');
    }
  };

  const handleReprint = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/donations/${id}`, { headers: { authorization: token } });
      const donation = res.data.donation;
      printReceipt({ donation, orgName, contactPhone });
    } catch (error) {
      toast.error('Failed to load receipt for reprint');
    }
  };

  if (!data) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>My Dashboard</h1>

        <div style={styles.userCard}>
          <div style={styles.userAvatar}>{data.user.full_name.charAt(0).toUpperCase()}</div>
          <div>
            <h3 style={styles.userName}>{data.user.full_name}</h3>
            <p style={styles.userDetail}>{data.user.email}</p>
            <p style={styles.userDetail}>Role: Teller</p>
            <p style={styles.userDetail}>Joined: {new Date(data.user.created_at).toLocaleDateString()}</p>
            <p style={styles.userDetail}>Assigned Funerals: {data.assigned_funerals.length}</p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Donations Recorded</p>
            <h2 style={styles.statValue}>{data.total_donations}</h2>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Amount Recorded</p>
            <h2 style={styles.statValue}>GHS {parseFloat(data.total_amount || 0).toFixed(2)}</h2>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Today's Donations</p>
            <h2 style={styles.statValue}>{data.today_donations}</h2>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Today's Amount</p>
            <h2 style={styles.statValue}>GHS {parseFloat(data.today_amount || 0).toFixed(2)}</h2>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>My Recent Entries</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Receipt No</th>
                <th style={styles.th}>Donor</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Recipient</th>
                <th style={styles.th}>Method</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_donations.map(d => (
                editingId === d.id ? (
                  <tr key={d.id} style={styles.editRow}>
                    <td style={styles.td}>{d.receipt_number}</td>
                    <td style={styles.td}>
                      <input style={styles.editInput} value={editForm.donor_name} onChange={(e) => setEditForm({...editForm, donor_name: e.target.value})} />
                    </td>
                    <td style={styles.td}>
                      <input style={styles.editInput} value={editForm.phone_number} onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})} />
                    </td>
                    <td style={styles.td}>
                      <input style={styles.editInput} type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                    </td>
                    <td style={styles.td}>
                      <select style={styles.editInput} value={editForm.recipient_id} onChange={(e) => setEditForm({...editForm, recipient_id: e.target.value})}>
                        {recipients.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </td>
                    <td style={styles.td}>
                      <select style={styles.editInput} value={editForm.payment_method} onChange={(e) => setEditForm({...editForm, payment_method: e.target.value})}>
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </td>
                    <td style={styles.td}>{new Date(d.created_at).toLocaleString()}</td>
                    <td style={styles.td}>
                      <button style={styles.saveBtn} onClick={() => submitEditRequest(d.id)}>Submit</button>
                      <button style={styles.cancelBtn} onClick={cancelEdit}>Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.receipt_number}</td>
                    <td style={styles.td}>{d.donor_name}</td>
                    <td style={styles.td}>{d.phone_number}</td>
                    <td style={styles.td}>GHS {parseFloat(d.amount).toFixed(2)}</td>
                    <td style={styles.td}>{d.recipient_name}</td>
                    <td style={styles.td}>{d.payment_method}</td>
                    <td style={styles.td}>{new Date(d.created_at).toLocaleString()}</td>
                    <td style={styles.td}>
                      <button style={styles.printBtnSmall} onClick={() => handleReprint(d.id)}>🖨️ Reprint</button>
                      <button style={styles.editBtn} onClick={() => startEdit(d)}>✏️ Request Edit</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
          {data.recent_donations.length === 0 && <p style={styles.empty}>No donations recorded yet</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  userCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  userAvatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '700' },
  userName: { fontSize: '17px', fontWeight: '700', color: '#1a3c5e' },
  userDetail: { fontSize: '13px', color: '#666', marginTop: '2px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  statLabel: { fontSize: '13px', color: '#666' },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#1a3c5e', marginTop: '8px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflowX: 'auto' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1a3c5e', marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '950px' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
  editRow: { background: '#fff8e1' },
  editInput: { padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px', width: '100px' },
  printBtnSmall: { padding: '6px 10px', background: '#f0f0f0', border: '1px solid #888', borderRadius: '6px', color: '#555', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  editBtn: { padding: '6px 10px', background: '#e8f0fe', border: '1px solid #2d6a9f', borderRadius: '6px', color: '#2d6a9f', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginLeft: '6px' },
  saveBtn: { padding: '6px 10px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  cancelBtn: { padding: '6px 10px', background: '#6c757d', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  loading: { padding: '40px', textAlign: 'center' },
};

export default TellerDashboard;