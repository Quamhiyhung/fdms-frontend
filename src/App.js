import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import FuneralAdminDashboard from './pages/FuneralAdminDashboard';
import TellerDashboard from './pages/TellerDashboard';
import FuneralList from './pages/FuneralList';
import DonationForm from './pages/DonationForm';
import Donations from './pages/Donations';
import Recipients from './pages/Recipients';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import AuditTrail from './pages/AuditTrail';
import Messaging from './pages/Messaging';
import Assignments from './pages/Assignments';
import SearchDonations from './pages/SearchDonations';
import ChangePassword from './pages/ChangePassword';
import EditRequests from './pages/EditRequests';
import SystemSettings from './pages/SystemSettings';

function App() {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;

  const getDashboard = () => {
    if (!user) return '/login';
    if (user.role_id === 1) return '/dashboard/super-admin';
    if (user.role_id === 2) return '/dashboard/funeral-admin';
    return '/dashboard/teller';
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to={getDashboard()} />} />
        <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/dashboard/funeral-admin" element={<FuneralAdminDashboard />} />
        <Route path="/dashboard/teller" element={<TellerDashboard />} />
        <Route path="/funerals" element={<FuneralList />} />
        <Route path="/donations/record" element={<DonationForm />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/recipients" element={<Recipients />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/search" element={<SearchDonations />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/edit-requests" element={<EditRequests />} />  
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </Router>
  );
}

export default App;