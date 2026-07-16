import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';

const FuneralList = () => {
  const [funerals, setFunerals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ funeral_id: '', deceased_name: '', funeral_date: '', venue: '' });
  const [photo, setPhoto] = useState(null);
  const [editingFuneral, setEditingFuneral] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editPhoto, setEditPhoto] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchFunerals(); }, []);

  const fetchFunerals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/funerals/all`, { headers: { authorization: token } });
      setFunerals(res.data.funerals);
    } catch (error) {
      toast.error('Failed to load funerals');
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('funeral_id', form.funeral_id);
      formData.append('deceased_name', form.deceased_name);
      formData.append('funeral_date', form.funeral_date);
      formData.append('venue', form.venue);
      if (photo) formData.append('photo', photo);
      await axios.post(`${API_BASE}/api/funerals/create`, formData, {
        headers: { authorization: token, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Funeral created successfully!');
      setShowForm(false);
      setForm({ funeral_id: '', deceased_name: '', funeral_date: '', venue: '' });
      setPhoto(null);
      fetchFunerals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create funeral');
    }
  };

  const startEdit = (f) => {
    setEditingFuneral(f.id);
    setEditForm({ deceased_name: f.deceased_name, funeral_date: f.funeral_date?.split('T')[0], venue: f.venue, existing_photo: f.photo || '' });
    setEditPhoto(null);
  };

  const saveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('deceased_name', editForm.deceased_name);
      formData.append('funeral_date', editForm.funeral_date);
      formData.append('venue', editForm.venue);
      formData.append('existing_photo', editForm.existing_photo);
      if (editPhoto) formData.append('photo', editPhoto);
      await axios.put(`${API_BASE}/api/funerals/${editingFuneral}/edit`, formData, {
        headers: { authorization: token, 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Funeral updated successfully!');
      setEditingFuneral(null);
      fetchFunerals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update funeral');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/api/funerals/${deleteTarget}/delete`, { headers: { authorization: token } });
      toast.success('Funeral deleted successfully!');
      setDeleteTarget(null);
      fetchFunerals();
    } catch (error) {
      toast.error('Failed to delete funeral');
    }
  };

  const handleArchive = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/funerals/${id}/archive`, {}, { headers: { authorization: token } });
      toast.success('Funeral archived!');
      fetchFunerals();
    } catch (error) {
      toast.error('Failed to archive funeral');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/funerals/${id}/unarchive`, {}, { headers: { authorization: token } });
      toast.success('Funeral unarchived!');
      fetchFunerals();
    } catch (error) {
      toast.error('Failed to unarchive funeral');
    }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/funerals/${id}/close`, {}, { headers: { authorization: token } });
      toast.success('Funeral closed!');
      fetchFunerals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close funeral');
    }
  };

  const handleReopen = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/funerals/${id}/reopen`, {}, { headers: { authorization: token } });
      toast.success('Funeral reopened!');
      fetchFunerals();
    } catch (error) {
      toast.error('Failed to reopen funeral');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#28a745';
      case 'Upcoming': return '#ffc107';
      case 'Closed': return '#dc3545';
      case 'Archived': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const isLocked = (f) => ['Closed', 'Archived'].includes(f.status);

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Funerals</h1>
          {user?.role_id === 1 && (
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Funeral'}
            </button>
          )}
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Funeral</h3>
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Funeral ID</label>
                  <input style={styles.input} placeholder="e.g. FUN-002" value={form.funeral_id} onChange={(e) => setForm({...form, funeral_id: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Deceased Name</label>
                  <input style={styles.input} placeholder="Full name" value={form.deceased_name} onChange={(e) => setForm({...form, deceased_name: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Funeral Date</label>
                  <input style={styles.input} type="date" value={form.funeral_date} onChange={(e) => setForm({...form, funeral_date: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Venue</label>
                  <input style={styles.input} placeholder="Location" value={form.venue} onChange={(e) => setForm({...form, venue: e.target.value})} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Photo of Deceased</label>
                  <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} style={styles.input} />
                </div>
                {photo && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Preview</label>
                    <img src={URL.createObjectURL(photo)} alt="Preview" style={styles.preview} />
                  </div>
                )}
              </div>
              <button type="submit" style={styles.submitBtn}>Create Funeral</button>
            </form>
          </div>
        )}

        <div style={styles.grid}>
          {loading ? <p>Loading...</p> : funerals.map((f) => (
            editingFuneral === f.id ? (
              <div key={f.id} style={styles.editCard}>
                <h4 style={styles.editTitle}>Editing: {f.funeral_id}</h4>
                <input style={styles.editInput} placeholder="Deceased Name" value={editForm.deceased_name} onChange={(e) => setEditForm({...editForm, deceased_name: e.target.value})} />
                <input style={styles.editInput} type="date" value={editForm.funeral_date} onChange={(e) => setEditForm({...editForm, funeral_date: e.target.value})} />
                <input style={styles.editInput} placeholder="Venue" value={editForm.venue} onChange={(e) => setEditForm({...editForm, venue: e.target.value})} />
                <input style={styles.editInput} type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files[0])} />
                <div style={styles.editActions}>
                  <button style={styles.saveBtn} onClick={saveEdit}>Save</button>
                  <button style={styles.cancelBtn} onClick={() => setEditingFuneral(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div key={f.id} style={{...styles.card, opacity: isLocked(f) ? 0.85 : 1}}>
                {f.photo ? <img src={f.photo} alt={f.deceased_name} style={styles.cardPhoto} /> : <div style={styles.noPhoto}>No Photo</div>}

                {isLocked(f) && (
                  <div style={styles.lockedBanner}>
                    🔒 {f.status} — Donations {f.status === 'Closed' ? 'Closed' : 'Archived'}
                  </div>
                )}

                <div style={styles.cardHeader}>
                  <span style={styles.funeralId}>{f.funeral_id}</span>
                  <span style={{...styles.status, background: getStatusColor(f.status)}}>{f.status}</span>
                </div>
                <h3 style={styles.deceasedName}>{f.deceased_name}</h3>
                <p style={styles.cardDetail}>📅 {new Date(f.funeral_date).toLocaleDateString()}</p>
                <p style={styles.cardDetail}>📍 {f.venue}</p>

                <div style={styles.cardActions}>
                  {user?.role_id === 1 && (
                    <>
                      <button style={styles.editBtn} onClick={() => startEdit(f)}>✏️ Edit</button>
                      <button style={styles.deleteBtn} onClick={() => setDeleteTarget(f.id)}>🗑️ Delete</button>
                      {f.status === 'Archived' ? (
                        <button style={styles.unarchiveBtn} onClick={() => handleUnarchive(f.id)}>📤 Unarchive</button>
                      ) : (
                        <button style={styles.archiveBtn} onClick={() => handleArchive(f.id)}>📦 Archive</button>
                      )}
                      {f.status === 'Closed' && (
                        <button style={styles.reopenBtn} onClick={() => handleReopen(f.id)}>🔓 Reopen</button>
                      )}
                    </>
                  )}
                  {(user?.role_id === 1 || user?.role_id === 2) && f.status !== 'Closed' && f.status !== 'Archived' && (
                    <button style={styles.closeBtn} onClick={() => handleClose(f.id)}>🔒 Close Donations</button>
                  )}
                </div>
              </div>
            )
          ))}
        </div>

        {deleteTarget && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Delete Funeral?</h3>
              <p style={styles.modalText}>This will permanently delete the funeral record. This action cannot be undone.</p>
              <div style={styles.modalActions}>
                <button style={styles.modalCancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button style={styles.modalDeleteBtn} onClick={handleDelete}>Confirm Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#f0f2f5' },
  main: { marginLeft: '250px', flex: 1, padding: '30px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a3c5e' },
  addBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '18px', fontWeight: '600', color: '#1a3c5e', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  submitBtn: { padding: '12px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px', fontWeight: '600', width: '200px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardPhoto: { width: '100%', height: '160px', objectFit: 'cover' },
  noPhoto: { width: '100%', height: '160px', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '14px' },
  lockedBanner: { background: '#fff3cd', color: '#856404', fontSize: '11px', fontWeight: '600', padding: '6px 12px', textAlign: 'center' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 16px 8px' },
  funeralId: { fontSize: '12px', fontWeight: '600', color: '#2d6a9f', background: '#e8f0fe', padding: '4px 8px', borderRadius: '4px' },
  status: { fontSize: '11px', fontWeight: '600', color: '#fff', padding: '4px 8px', borderRadius: '4px' },
  deceasedName: { fontSize: '16px', fontWeight: '700', color: '#1a3c5e', margin: '0 16px 8px' },
  cardDetail: { fontSize: '13px', color: '#666', margin: '0 16px 6px' },
  preview: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a3c5e' },
  cardActions: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px 16px 16px' },
  editBtn: { padding: '6px 10px', background: '#e8f0fe', border: '1px solid #2d6a9f', borderRadius: '6px', color: '#2d6a9f', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  deleteBtn: { padding: '6px 10px', background: '#fde8e8', border: '1px solid #dc3545', borderRadius: '6px', color: '#dc3545', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  archiveBtn: { padding: '6px 10px', background: '#f0f0f0', border: '1px solid #888', borderRadius: '6px', color: '#555', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  unarchiveBtn: { padding: '6px 10px', background: '#e8f5e9', border: '1px solid #28a745', borderRadius: '6px', color: '#28a745', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  closeBtn: { padding: '6px 10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', color: '#856404', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  reopenBtn: { padding: '6px 10px', background: '#e0f7fa', border: '1px solid #00838f', borderRadius: '6px', color: '#00838f', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  editCard: { background: '#fff8e1', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' },
  editTitle: { fontSize: '14px', fontWeight: '700', color: '#1a3c5e' },
  editInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' },
  editActions: { display: 'flex', gap: '8px', marginTop: '6px' },
  saveBtn: { padding: '8px 16px', background: '#28a745', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '8px 16px', background: '#6c757d', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '10px', padding: '24px', width: '400px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#dc3545', marginBottom: '10px' },
  modalText: { fontSize: '13px', color: '#666', marginBottom: '16px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  modalCancelBtn: { padding: '10px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  modalDeleteBtn: { padding: '10px 20px', background: '#dc3545', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};

export default FuneralList;