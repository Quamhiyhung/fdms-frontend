import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const [orgName, setOrgName] = useState('FDMS');


  useEffect(() => {
  const fetchOrgName = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/settings/public/organization_name`,
        {
          headers: { authorization: token }
        }
      );

      setOrgName(res.data.value);
    } catch (error) {
      // fallback stays as FDMS
    }
  };

  fetchOrgName();
}, [token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItem = (path, icon, label) => (
    <button
      style={{
        ...styles.navItem,
        background: isActive(path) ? 'rgba(200,169,81,0.2)' : 'transparent',
        borderLeft: isActive(path) ? '3px solid #c8a951' : '3px solid transparent',
        color: isActive(path) ? '#c8a951' : 'rgba(255,255,255,0.8)',
      }}
      onClick={() => navigate(path)}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <h2 style={styles.logoText}>{orgName}</h2>
        <p style={styles.logoSub}>
          {user?.role_id === 1 ? 'Super Admin' : user?.role_id === 2 ? 'Funeral Admin' : 'Teller'}
        </p>
      </div>

      <nav style={styles.nav}>
        {user?.role_id === 1 && (
          <>
            {navItem('/dashboard/super-admin', '📊', 'Dashboard')}
            {navItem('/funerals', '⚰️', 'Funerals')}
            {navItem('/assignments', '🔗', 'Assignments')}
            {navItem('/donations', '💰', 'Donations')}
            {navItem('/donations/record', '➕', 'Record Donation')}
            {navItem('/recipients', '👥', 'Recipients')}
            {navItem('/search', '🔍', 'Search Donations')}
            {navItem('/reports', '📈', 'Reports')}
            {navItem('/users', '👤', 'User Management')}
            {navItem('/messaging', '📱', 'Bulk Messaging')}
            {navItem('/edit-requests', '✅', 'Edit Requests')}
            {navItem('/audit', '🔍', 'Audit Trail')}
            {navItem('/settings', '⚙️', 'System Settings')}
            {navItem('/change-password', '🔑', 'Change Password')}
          </>
        )}

        {user?.role_id === 2 && (
          <>
            {navItem('/dashboard/funeral-admin', '📊', 'Dashboard')}
            {navItem('/donations', '💰', 'Donations')}
            {navItem('/recipients', '👥', 'Recipients')}
            {navItem('/search', '🔍', 'Search Donations')}
            {navItem('/reports', '📈', 'Reports')}
            {navItem('/edit-requests', '✅', 'Edit Requests')}
            {navItem('/change-password', '🔑', 'Change Password')}
          </>
        )}

        {user?.role_id === 3 && (
          <>
            {navItem('/dashboard/teller', '📊', 'Dashboard')}
            {navItem('/donations/record', '➕', 'Record Donation')}
            {navItem('/search', '🔍', 'Search Donations')}
            {navItem('/change-password', '🔑', 'Change Password')}
          </>
        )}
      </nav>

      <div style={styles.userInfo}>
        <p style={styles.userName}>{user?.full_name}</p>
        <p style={styles.userEmail}>{user?.email}</p>
      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: { width: '250px', background: 'linear-gradient(180deg, #1a3c5e 0%, #0d2137 100%)', display: 'flex', flexDirection: 'column', padding: '20px 0', position: 'fixed', height: '100vh', overflowY: 'auto' },
  logo: { textAlign: 'center', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' },
  logoText: { color: '#c8a951', fontSize: '24px', fontWeight: '800', letterSpacing: '2px' },
  logoSub: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' },
  nav: { flex: 1, padding: '10px 0' },
  navItem: { display: 'block', width: '100%', padding: '12px 24px', border: 'none', fontSize: '13px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' },
  userInfo: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  userName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
  userEmail: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' },
  logoutBtn: { margin: '16px', padding: '12px', background: 'rgba(220,53,69,0.2)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '8px', color: '#ff6b7a', cursor: 'pointer', fontSize: '14px' },
};

export default Sidebar;