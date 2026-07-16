import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const SearchDonations = () => {
  const [funerals, setFunerals] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [filters, setFilters] = useState({ funeral_id: '', donor_name: '', phone_number: '', amount: '', recipient_id: '', start_date: '', end_date: '' });
  const [results, setResults] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchFunerals(); }, []);

  const fetchFunerals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/funerals/all`, { headers: { authorization: token } });
      setFunerals(res.data.funerals);
    } catch (error) {
      toast.error('Failed to load funerals');
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
    setFilters({ ...filters, funeral_id: e.target.value });
    if (e.target.value) fetchRecipients(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) params.append(key, value); });
      const res = await axios.get(`${API_BASE}/api/donations/search?${params.toString()}`, { headers: { authorization: token } });
      setResults(res.data.donations);
    } catch (error) {
      toast.error('Failed to search donations');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Search Donations</h1>

        <div style={styles.card}>
          <div style={styles.filterGrid}>
            <div>
              <label style={styles.label}>Funeral</label>
              <select style={styles.input} value={filters.funeral_id} onChange={handleFuneralChange}>
                <option value="">All My Funerals</option>
                {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Donor Name</label>
              <input style={styles.input} placeholder="Search by name" value={filters.donor_name} onChange={(e) => setFilters({...filters, donor_name: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Phone Number</label>
              <input style={styles.input} placeholder="Search by phone" value={filters.phone_number} onChange={(e) => setFilters({...filters, phone_number: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Amount</label>
              <input style={styles.input} type="number" placeholder="Exact amount" value={filters.amount} onChange={(e) => setFilters({...filters, amount: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Recipient</label>
              <select style={styles.input} value={filters.recipient_id} onChange={(e) => setFilters({...filters, recipient_id: e.target.value})}>
                <option value="">All Recipients</option>
                {recipients.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Start Date</label>
              <input type="date" style={styles.input} value={filters.start_date} onChange={(e) => setFilters({...filters, start_date: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>End Date</label>
              <input type="date" style={styles.input} value={filters.end_date} onChange={(e) => setFilters({...filters, end_date: e.target.value})} />
            </div>
          </div>
          <button style={styles.btn} onClick={handleSearch}>🔍 Search</button>
        </div>

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
              </tr>
            </thead>
            <tbody>
              {results.map(d => (
                <tr key={d.id}>
                  <td style={styles.td}>{d.receipt_number}</td>
                  <td style={styles.td}>{d.donor_name}</td>
                  <td style={styles.td}>{d.phone_number}</td>
                  <td style={styles.td}>GHS {parseFloat(d.amount).toFixed(2)}</td>
                  <td style={styles.td}>{d.recipient_name}</td>
                  <td style={styles.td}>{d.payment_method}</td>
                  <td style={styles.td}>{d.teller_name}</td>
                  <td style={styles.td}>{new Date(d.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && <p style={styles.empty}>No results yet — try a search above</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflowX: 'auto' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%' },
  btn: { padding: '12px 24px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
};

export default SearchDonations;