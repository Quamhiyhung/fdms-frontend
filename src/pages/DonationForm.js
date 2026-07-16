import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import printReceipt from '../utils/printReceipt';

const DonationForm = () => {
  const [funerals, setFunerals] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [form, setForm] = useState({ funeral_id: '', donor_name: '', phone_number: '', amount: '', recipient_ids: [], payment_method: 'Cash', notes: '' });
  const [lastReceipt, setLastReceipt] = useState(null);
  const [orgName, setOrgName] = useState('FDMS');
  const [contactPhone, setContactPhone] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchFunerals(); fetchOrgName(); fetchContactPhone(); }, []);

  const fetchOrgName = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/settings/public/organization_name', { headers: { authorization: token } });
      setOrgName(res.data.value);
    } catch (error) {}
  };

  const fetchContactPhone = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/settings/public/contact_phone', { headers: { authorization: token } });
      setContactPhone(res.data.value);
    } catch (error) {}
  };

  const fetchFunerals = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/funerals/all', { headers: { authorization: token } });
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
    const funeral_id = e.target.value;
    setForm({ ...form, funeral_id, recipient_ids: [] });
    if (funeral_id) fetchRecipients(funeral_id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.recipient_ids.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    try {
      const res = await axios.post('${API_BASE}/api/donations/record', form, { headers: { authorization: token } });
      toast.success('Donation recorded successfully!');
      const donation = res.data.donation;
      setLastReceipt(donation);
      const funeral = funerals.find(f => f.id === parseInt(form.funeral_id));
      printReceipt({ donation, funeral, orgName, contactPhone });
      setForm({ funeral_id: '', donor_name: '', phone_number: '', amount: '', recipient_ids: [], payment_method: 'Cash', notes: '' });
      setRecipients([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record donation');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Record Donation</h1>
        </div>

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Funeral</label>
              <select style={styles.input} value={form.funeral_id} onChange={handleFuneralChange} required>
                <option value="">-- Select Funeral --</option>
                {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name} ({f.funeral_id})</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Donor Name</label>
              <input style={styles.input} placeholder="Full name" value={form.donor_name} onChange={(e) => setForm({...form, donor_name: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input style={styles.input} placeholder="e.g. 0244123456" value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount (GHS)</label>
              <input style={styles.input} type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Recipient(s)</label>
              <div style={styles.checkboxGrid}>
                {recipients.map(r => (
                  <label key={r.id} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={form.recipient_ids.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({...form, recipient_ids: [...form.recipient_ids, r.id]});
                        } else {
                          setForm({...form, recipient_ids: form.recipient_ids.filter(id => id !== r.id)});
                        }
                      }}
                    />
                    {r.name}
                  </label>
                ))}
                {recipients.length === 0 && <p style={{fontSize: '12px', color: '#aaa', margin: 0}}>Select a funeral first</p>}
              </div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Payment Method</label>
              <select style={styles.input} value={form.payment_method} onChange={(e) => setForm({...form, payment_method: e.target.value})}>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Notes (Optional)</label>
              <textarea style={{...styles.input, height: '80px'}} placeholder="Any additional notes" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
            </div>
            <button type="submit" style={styles.submitBtn}>Record Donation & Print Receipt</button>
          </form>

          {lastReceipt && (
            <div style={styles.lastReceiptBar}>
              <p style={styles.lastReceiptText}>✅ Last receipt: <strong>{lastReceipt.receipt_number}</strong> — {lastReceipt.donor_name} — GHS {parseFloat(lastReceipt.amount).toFixed(2)}</p>
              <button style={styles.reprintBtn} onClick={() => {
                const funeral = funerals.find(f => f.id === lastReceipt.funeral_id);
                printReceipt({ donation: lastReceipt, funeral, orgName, contactPhone });
              }}>🖨️ Reprint Last</button>
            </div>
          )}
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
  formCard: { background: '#fff', borderRadius: '10px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', maxWidth: '600px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  checkboxGrid: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333' },
  submitBtn: { padding: '14px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  lastReceiptBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '12px 16px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #28a745' },
  lastReceiptText: { fontSize: '13px', color: '#333' },
  reprintBtn: { padding: '8px 16px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
};

export default DonationForm;