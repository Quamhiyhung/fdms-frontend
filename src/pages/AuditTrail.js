import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/audit-logs`, { headers: { authorization: token } });
      setLogs(res.data.logs);
    } catch (error) {
      toast.error('Failed to load audit logs');
    }
  };

  const handleRestore = async (logId) => {
    if (!window.confirm('Restore this record to its previous state?')) return;
    try {
      const res = await axios.put(`${API_BASE}/api/auth/audit-logs/${logId}/restore`, {}, { headers: { authorization: token } });
      toast.success(res.data.message);
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restore record');
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'LOGIN': return '#2d6a9f';
      case 'EDIT': return '#ffc107';
      case 'DELETE': return '#dc3545';
      case 'ARCHIVE': return '#6c757d';
      case 'CLOSE': return '#856404';
      case 'ACTIVATE': return '#28a745';
      case 'DEACTIVATE': return '#dc3545';
      case 'RESTORE': return '#17a2b8';
      default: return '#888';
    }
  };

  const isRestorable = (log) => {
    if (!log.old_values) return false;
    if (log.entity_type === 'user' && log.action === 'DELETE') return false;
    return ['DELETE', 'EDIT', 'ARCHIVE', 'CLOSE', 'DEACTIVATE'].includes(log.action);
  };

  const filteredLogs = logs.filter(l =>
    (filterAction ? l.action === filterAction : true) &&
    (filterEntity ? l.entity_type === filterEntity : true)
  );

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Audit Trail</h1>

        <div style={styles.card}>
          <div style={styles.filterRow}>
            <select style={styles.input} value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="EDIT">Edit</option>
              <option value="DELETE">Delete</option>
              <option value="ARCHIVE">Archive</option>
              <option value="CLOSE">Close</option>
              <option value="ACTIVATE">Activate</option>
              <option value="DEACTIVATE">Deactivate</option>
              <option value="RESTORE">Restore</option>
            </select>
            <select style={styles.input} value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}>
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="donation">Donation</option>
              <option value="funeral">Funeral</option>
            </select>
          </div>
        </div>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Entity</th>
                <th style={styles.th}>Entity ID</th>
                <th style={styles.th}>Date/Time</th>
                <th style={styles.th}>Details</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={styles.td}>{log.user_name || 'Unknown'}</td>
                  <td style={styles.td}>
                    <span style={{...styles.actionBadge, background: getActionColor(log.action)}}>{log.action}</span>
                  </td>
                  <td style={styles.td}>{log.entity_type}</td>
                  <td style={styles.td}>#{log.entity_id}</td>
                  <td style={styles.td}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={styles.td}>
                    {log.old_values && <span style={styles.detailTag}>Before: {JSON.stringify(log.old_values).slice(0, 60)}...</span>}
                    {log.new_values && <span style={styles.detailTag}>After: {JSON.stringify(log.new_values).slice(0, 60)}...</span>}
                  </td>
                  <td style={styles.td}>
                    {isRestorable(log) && (
                      <button style={styles.restoreBtn} onClick={() => handleRestore(log.id)}>↩️ Restore</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && <p style={styles.empty}>No audit logs found</p>}
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
  filterRow: { display: 'flex', gap: '16px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
  actionBadge: { padding: '4px 10px', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: '600' },
  detailTag: { display: 'block', fontSize: '11px', color: '#888', marginBottom: '2px' },
  restoreBtn: { padding: '6px 12px', background: '#17a2b8', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
};

export default AuditTrail;