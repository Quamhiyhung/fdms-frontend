import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const EditRequests = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/donations/edit-requests/pending`, { headers: { authorization: token } });
      setRequests(res.data.requests);
    } catch (error) {
      toast.error('Failed to load edit requests');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/donations/edit-requests/${id}/approve`, {}, { headers: { authorization: token } });
      toast.success('Edit request approved and applied!');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    const review_note = window.prompt('Reason for rejection (optional):') || '';
    try {
      await axios.put(`${API_BASE}/api/donations/edit-requests/${id}/reject`, { review_note }, { headers: { authorization: token } });
      toast.success('Edit request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Pending Edit Requests</h1>

        <div style={styles.card}>
          {requests.length === 0 && <p style={styles.empty}>No pending edit requests</p>}
          {requests.map(r => (
            <div key={r.id} style={styles.requestCard}>
              <div style={styles.requestHeader}>
                <span style={styles.receiptNo}>{r.receipt_number}</span>
                <span style={styles.requestedBy}>Requested by {r.requested_by_name}</span>
              </div>
              <div style={styles.compareGrid}>
                <div style={styles.compareCol}>
                  <p style={styles.compareLabel}>Current</p>
                  <p style={styles.compareValue}>Donor: {r.original_donor_name}</p>
                  <p style={styles.compareValue}>Amount: GHS {parseFloat(r.original_amount).toFixed(2)}</p>
                </div>
                <div style={styles.compareCol}>
                  <p style={styles.compareLabel}>Proposed</p>
                  <p style={styles.compareValue}>Donor: {r.proposed_donor_name}</p>
                  <p style={styles.compareValue}>Amount: GHS {parseFloat(r.proposed_amount).toFixed(2)}</p>
                  <p style={styles.compareValue}>Phone: {r.proposed_phone_number}</p>
                  <p style={styles.compareValue}>Method: {r.proposed_payment_method}</p>
                  {r.proposed_notes && <p style={styles.compareValue}>Notes: {r.proposed_notes}</p>}
                </div>
              </div>
              <div style={styles.requestActions}>
                <button style={styles.approveBtn} onClick={() => handleApprove(r.id)}>✅ Approve</button>
                <button style={styles.rejectBtn} onClick={() => handleReject(r.id)}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  empty: { color: '#aaa', fontSize: '14px' },
  requestCard: { background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '14px', border: '1px solid #eee' },
  requestHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  receiptNo: { fontSize: '13px', fontWeight: '700', color: '#1a3c5e' },
  requestedBy: { fontSize: '12px', color: '#888' },
  compareGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' },
  compareCol: { background: '#fff', borderRadius: '6px', padding: '10px' },
  compareLabel: { fontSize: '11px', fontWeight: '700', color: '#888', marginBottom: '6px', textTransform: 'uppercase' },
  compareValue: { fontSize: '13px', color: '#333', marginBottom: '4px' },
  requestActions: { display: 'flex', gap: '10px' },
  approveBtn: { padding: '8px 16px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { padding: '8px 16px', background: '#dc3545', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
};

export default EditRequests;