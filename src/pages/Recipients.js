import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const Recipients = () => {
  const [funerals, setFunerals] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [form, setForm] = useState({ name: '', relationship: '' });
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
    if (e.target.value) fetchRecipients(e.target.value);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const fullName = form.relationship
        ? `${form.name} (${form.relationship})`
        : form.name;
      await axios.post(`${API_BASE}/api/donations/recipients/add`,
        { funeral_id: selectedFuneral, name: fullName },
        { headers: { authorization: token } }
      );
      toast.success('Recipient added!');
      setForm({ name: '', relationship: '' });
      fetchRecipients(selectedFuneral);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add recipient');
    }
  };

  const relationships = ['Wife', 'Husband', 'Son', 'Daughter', 'Brother', 'Sister', 'Family Head', 'Burial Committee', 'Other'];

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Recipients Management</h1>
        </div>

        {/* Select Funeral */}
        <div style={styles.card}>
          <label style={styles.label}>Select Funeral</label>
          <select style={styles.select} value={selectedFuneral} onChange={handleFuneralChange}>
            <option value="">-- Select Funeral --</option>
            {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name} ({f.funeral_id})</option>)}
          </select>
        </div>

        {selectedFuneral && (
          <>
            {/* Add Recipient */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Add Recipient</h3>
              <form onSubmit={handleAdd} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Akosua Mensah"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Relationship to Deceased</label>
                  <select
                    style={styles.input}
                    value={form.relationship}
                    onChange={(e) => setForm({...form, relationship: e.target.value})}
                  >
                    <option value="">-- Select Relationship --</option>
                    {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button type="submit" style={styles.addBtn}>Add Recipient</button>
              </form>
            </div>

            {/* Recipients List */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Current Recipients ({recipients.length})</h3>
              <div style={styles.recipientGrid}>
                {recipients.map(r => (
                  <div key={r.id} style={styles.recipientCard}>
                    <div style={styles.recipientAvatar}>
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.recipientName}>{r.name}</p>
                      <p style={styles.recipientDate}>Added {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {recipients.length === 0 && <p style={styles.empty}>No recipients added yet</p>}
              </div>
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
  topBar: { marginBottom: '24px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1a3c5e', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' },
  select: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  addBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', height: '42px' },
  recipientGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  recipientCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' },
  recipientAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  recipientName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  recipientDate: { fontSize: '11px', color: '#aaa', marginTop: '2px' },
  empty: { color: '#aaa', fontSize: '14px', gridColumn: '1/-1' },
};

export default Recipients;