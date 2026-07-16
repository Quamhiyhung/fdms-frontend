import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import printReceipt from '../utils/printReceipt';

const Donations = () => {
  const [funerals, setFunerals] = useState([]);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [donations, setDonations] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [orgName, setOrgName] = useState('FDMS');
  const [contactPhone, setContactPhone] = useState('');
  const token = localStorage.getItem('token');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFunerals(); fetchOrgName(); fetchContactPhone(); }, []);

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

  const fetchFunerals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/funerals/all`, { headers: { authorization: token } });
      setFunerals(res.data.funerals);
    } catch (error) {
      toast.error('Failed to load funerals');
    }
  };

  const fetchDonations = async (funeral_id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/donations/funeral/${funeral_id}`, { headers: { authorization: token } });
      setDonations(res.data.donations);
    } catch (error) {
      toast.error('Failed to load donations');
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

  const handleFuneralChange = (e) => {
    setSelectedFuneral(e.target.value);
    if (e.target.value) {
      fetchDonations(e.target.value);
      fetchRecipients(e.target.value);
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/donations/${id}/edit`, editForm, { headers: { authorization: token } });
      toast.success('Donation updated successfully!');
      setEditingId(null);
      fetchDonations(selectedFuneral);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update donation');
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteReason('');
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/api/donations/${deleteId}/delete`, {
        data: { reason: deleteReason },
        headers: { authorization: token }
      });
      toast.success('Donation deleted successfully!');
      setDeleteId(null);
      fetchDonations(selectedFuneral);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete donation');
    }
  };

  const handleReprint = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/donations/${id}`, { headers: { authorization: token } });
      const donation = res.data.donation;
      const funeral = funerals.find(f => f.id === donation.funeral_id);
      printReceipt({ donation, funeral, orgName, contactPhone });
    } catch (error) {
      toast.error('Failed to load receipt for reprint');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>All Donations</h1>

        <div style={styles.card}>
          <label style={styles.label}>Select Funeral</label>
          <select style={styles.select} value={selectedFuneral} onChange={handleFuneralChange}>
            <option value="">-- Select Funeral --</option>
            {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name} ({f.funeral_id})</option>)}
          </select>
        </div>

        {selectedFuneral && (
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Receipt No</th>
                  <th style={styles.th}>Donor</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Recipient</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Teller</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map(d => (
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
                      <td style={styles.td}>{d.teller_name}</td>
                      <td style={styles.td}>{new Date(d.created_at).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button style={styles.saveBtn} onClick={() => saveEdit(d.id)}>Save</button>
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
                      <td style={styles.td}>{d.teller_name}</td>
                      <td style={styles.td}>{new Date(d.created_at).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button style={styles.printBtnSmall} onClick={() => handleReprint(d.id)}>🖨️ Reprint</button>
                        <button style={styles.editBtn} onClick={() => startEdit(d)}>✏️ Edit</button>
                        <button style={styles.deleteBtn} onClick={() => confirmDelete(d.id)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
            {donations.length === 0 && <p style={styles.empty}>No donations recorded yet</p>}
          </div>
        )}

        {deleteId && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Confirm Deletion</h3>
              <p style={styles.modalText}>This will soft-delete the donation record. Please provide a reason:</p>
              <textarea
                style={styles.modalTextarea}
                placeholder="Reason for deletion..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
              <div style={styles.modalActions}>
                <button style={styles.modalCancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
                <button style={styles.modalDeleteBtn} onClick={handleDelete}>Confirm Delete</button>
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
  label: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' },
  select: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '950px' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
  editRow: { background: '#fff8e1' },
  editInput: { padding: '6px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '12px', width: '100px' },
  printBtnSmall: { padding: '6px 10px', background: '#f0f0f0', border: '1px solid #888', borderRadius: '6px', color: '#555', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  editBtn: { padding: '6px 10px', background: '#e8f0fe', border: '1px solid #2d6a9f', borderRadius: '6px', color: '#2d6a9f', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  deleteBtn: { padding: '6px 10px', background: '#fde8e8', border: '1px solid #dc3545', borderRadius: '6px', color: '#dc3545', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  saveBtn: { padding: '6px 10px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginRight: '6px' },
  cancelBtn: { padding: '6px 10px', background: '#6c757d', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '10px', padding: '24px', width: '400px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#dc3545', marginBottom: '10px' },
  modalText: { fontSize: '13px', color: '#666', marginBottom: '12px' },
  modalTextarea: { width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  modalCancelBtn: { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  modalDeleteBtn: { padding: '10px 20px', background: '#dc3545', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

export default Donations;