import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const Messaging = () => {
  const [funerals, setFunerals] = useState([]);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [message, setMessage] = useState('Dear donor, thank you for your kind donation. Your support means a lot to the family. God bless you.');
  const [campaigns, setCampaigns] = useState([]);
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

  const fetchCampaigns = async (funeral_id) => {
    try {
      const res = await axios.get(`${API_BASE}/api/messaging/campaigns/${funeral_id}`, { headers: { authorization: token } });
      setCampaigns(res.data.campaigns);
    } catch (error) {
      toast.error('Failed to load campaigns');
    }
  };

  const handleFuneralChange = (e) => {
    setSelectedFuneral(e.target.value);
    if (e.target.value) fetchCampaigns(e.target.value);
  };

  const createCampaign = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/messaging/create`,
        { funeral_id: selectedFuneral, message },
        { headers: { authorization: token } }
      );
      toast.success(`Campaign created for ${res.data.recipients} donors!`);
      fetchCampaigns(selectedFuneral);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    }
  };

  const sendCampaign = async (campaign_id) => {
    try {
      const res = await axios.post(`${API_BASE}/api/messaging/send/${campaign_id}`, {}, { headers: { authorization: token } });
      toast.success(res.data.message);
      fetchCampaigns(selectedFuneral);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Bulk Thank-You Messaging</h1>

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
              <h3 style={styles.cardTitle}>Create New Campaign</h3>
              <label style={styles.label}>Message</label>
              <textarea style={styles.textarea} value={message} onChange={(e) => setMessage(e.target.value)} />
              <button style={styles.btn} onClick={createCampaign}>Create Campaign</button>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Campaigns</h3>
              {campaigns.map(c => (
                <div key={c.id} style={styles.campaignCard}>
                  <div>
                    <p style={styles.campaignMsg}>{c.message}</p>
                    <p style={styles.campaignInfo}>
                      {c.sent_count}/{c.total_recipients} sent &middot; {c.status} &middot; {new Date(c.created_at).toLocaleString()}
                    </p>
                  </div>
                  {c.status === 'Pending' && (
                    <button style={styles.sendBtn} onClick={() => sendCampaign(c.id)}>Send Now</button>
                  )}
                </div>
              ))}
              {campaigns.length === 0 && <p style={styles.empty}>No campaigns yet</p>}
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
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%', height: '100px', marginBottom: '16px' },
  btn: { padding: '12px 24px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  campaignCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px' },
  campaignMsg: { fontSize: '13px', color: '#333', maxWidth: '500px' },
  campaignInfo: { fontSize: '12px', color: '#888', marginTop: '6px' },
  sendBtn: { padding: '8px 16px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  empty: { color: '#aaa', fontSize: '14px' },
};

export default Messaging;