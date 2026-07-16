import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const FuneralAdminDashboard = () => {
  const [funerals, setFunerals] = useState([]);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [data, setData] = useState(null);
  const token = localStorage.getItem('token');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFunerals(); }, []);

  const fetchFunerals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/funerals/all`, { headers: { authorization: token } });
      setFunerals(res.data.funerals);
    } catch (error) {
      toast.error('Failed to load funerals');
    }
  };

  const fetchDashboard = async (funeral_id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/dashboard/funeral-admin/${funeral_id}`, { headers: { authorization: token } });
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
  };

  const handleFuneralChange = (e) => {
    setSelectedFuneral(e.target.value);
    if (e.target.value) fetchDashboard(e.target.value);
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Funeral Admin Dashboard</h1>

        <div style={styles.card}>
          <label style={styles.label}>Select Funeral</label>
          <select style={styles.input} value={selectedFuneral} onChange={handleFuneralChange}>
            <option value="">-- Select Funeral --</option>
            {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name} ({f.funeral_id})</option>)}
          </select>
        </div>

        {data && (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Total Raised</p>
                <h2 style={styles.statValue}>GHS {parseFloat(data.total_raised || 0).toFixed(2)}</h2>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Total Donations</p>
                <h2 style={styles.statValue}>{data.total_donations}</h2>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>By Recipient</h3>
              {data.by_recipient.map((r, i) => (
                <div key={i} style={styles.row}>
                  <span>{r.name}</span>
                  <span style={styles.amount}>GHS {parseFloat(r.total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>By Teller</h3>
              {data.by_teller.map((t, i) => (
                <div key={i} style={styles.row}>
                  <span>{t.full_name}</span>
                  <span style={styles.amount}>GHS {parseFloat(t.total).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Recent Donations</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Receipt No</th>
                    <th style={styles.th}>Donor</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Recipient</th>
                    <th style={styles.th}>Teller</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_donations.map(d => (
                    <tr key={d.id}>
                      <td style={styles.td}>{d.receipt_number}</td>
                      <td style={styles.td}>{d.donor_name}</td>
                      <td style={styles.td}>GHS {parseFloat(d.amount).toFixed(2)}</td>
                      <td style={styles.td}>{d.recipient_name}</td>
                      <td style={styles.td}>{d.teller_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  label: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' },
  statCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  statLabel: { fontSize: '13px', color: '#666' },
  statValue: { fontSize: '26px', fontWeight: '700', color: '#1a3c5e', marginTop: '8px' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1a3c5e', marginBottom: '16px' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
  amount: { fontWeight: '600', color: '#1a3c5e' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
};

export default FuneralAdminDashboard;