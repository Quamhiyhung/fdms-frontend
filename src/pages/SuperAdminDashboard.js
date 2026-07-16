import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/dashboard/super-admin', {
        headers: { authorization: token }
      });
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
    setLoading(false);
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.welcome}>Welcome, {user?.full_name}</p>
        </div>

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderTop: '4px solid #1a3c5e'}}>
            <p style={styles.statLabel}>Total Funerals</p>
            <h2 style={styles.statValue}>{data?.total_funerals}</h2>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #28a745'}}>
            <p style={styles.statLabel}>Active Funerals</p>
            <h2 style={styles.statValue}>{data?.active_funerals}</h2>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #c8a951'}}>
            <p style={styles.statLabel}>Total Donations</p>
            <h2 style={styles.statValue}>{data?.total_donations}</h2>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #2d6a9f'}}>
            <p style={styles.statLabel}>Total Amount</p>
            <h2 style={styles.statValue}>GHS {parseFloat(data?.total_amount || 0).toFixed(2)}</h2>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #dc3545'}}>
            <p style={styles.statLabel}>Total Tellers</p>
            <h2 style={styles.statValue}>{data?.total_tellers}</h2>
          </div>
          <div style={{...styles.statCard, borderTop: '4px solid #6f42c1'}}>
            <p style={styles.statLabel}>Total Admins</p>
            <h2 style={styles.statValue}>{data?.total_admins}</h2>
          </div>
        </div>

        <div style={styles.tableCard}>
          <h3 style={styles.tableTitle}>Recent Donations</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Receipt No</th>
                <th style={styles.th}>Donor</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Funeral</th>
                <th style={styles.th}>Teller</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_donations?.map((d) => (
                <tr key={d.id} style={styles.tableRow}>
                  <td style={styles.td}>{d.receipt_number}</td>
                  <td style={styles.td}>{d.donor_name}</td>
                  <td style={styles.td}>GHS {parseFloat(d.amount).toFixed(2)}</td>
                  <td style={styles.td}>{d.deceased_name}</td>
                  <td style={styles.td}>{d.teller_name}</td>
                  <td style={styles.td}>{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e' },
  welcome: { color: '#666', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  statLabel: { color: '#666', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e' },
  tableCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  tableTitle: { fontSize: '18px', fontWeight: '600', color: '#1a3c5e', marginBottom: '15px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', fontSize: '13px', color: '#555' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px', color: '#1a3c5e' },
};

export default SuperAdminDashboard;