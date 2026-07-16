import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [editValues, setEditValues] = useState({});
  const token = localStorage.getItem('token');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/settings`, { headers: { authorization: token } });
      setSettings(res.data.settings);
      const initial = {};
      res.data.settings.forEach(s => { initial[s.setting_key] = s.setting_value; });
      setEditValues(initial);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async (key) => {
    try {
      await axios.put(`${API_BASE}/api/settings/${key}`, { value: editValues[key] }, { headers: { authorization: token } });
      toast.success('Setting updated successfully!');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/settings/backup/generate`, { headers: { authorization: token } });
      const dataStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FDMS_Backup_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate backup');
    }
  };

  const settingLabels = {
    organization_name: 'Organization Name',
    default_currency: 'Default Currency',
    duplicate_check_minutes: 'Duplicate Check Window (minutes)',
    backup_frequency_hours: 'Recommended Backup Frequency (hours)',
    contact_phone: 'Contact Phone (shown on receipts)'
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>System Settings & Backup</h1>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>General Settings</h3>
          {settings.map(s => (
            <div key={s.setting_key} style={styles.settingRow}>
              <label style={styles.settingLabel}>{settingLabels[s.setting_key] || s.setting_key}</label>
              <div style={styles.settingInputRow}>
                <input
                  style={styles.input}
                  value={editValues[s.setting_key] || ''}
                  onChange={(e) => setEditValues({...editValues, [s.setting_key]: e.target.value})}
                />
                <button style={styles.saveBtn} onClick={() => handleSave(s.setting_key)}>Save</button>
              </div>
              {s.updated_at && <p style={styles.lastUpdated}>Last updated: {new Date(s.updated_at).toLocaleString()}</p>}
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Database Backup</h3>
          <p style={styles.backupText}>
            Generate a full JSON backup of all users, funerals, recipients, donations, receipts, and assignments.
            Keep this file safe — it can be used to restore your data if needed.
          </p>
          <button style={styles.backupBtn} onClick={handleBackup}>💾 Generate & Download Backup</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#1a3c5e', marginBottom: '20px' },
  settingRow: { marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f0f0f0' },
  settingLabel: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' },
  settingInputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  saveBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  lastUpdated: { fontSize: '11px', color: '#aaa', marginTop: '6px' },
  backupText: { fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.6' },
  backupBtn: { padding: '12px 24px', background: '#28a745', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};

export default SystemSettings;