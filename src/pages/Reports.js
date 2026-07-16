import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';

const Reports = () => {
  const [funerals, setFunerals] = useState([]);
  const [filters, setFilters] = useState({ funeral_id: '', start_date: '', end_date: '', payment_method: '' });
  const [report, setReport] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchFunerals(); }, []);

  const fetchFunerals = async () => {
    try {
      const res = await axios.get('${API_BASE}/api/funerals/all', { headers: { authorization: token } });
      setFunerals(res.data.funerals);
    } catch (error) {
      toast.error('Failed to load funerals');
    }
  };

  const generateReport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) params.append(key, value); });
      const res = await axios.get(`${API_BASE}/api/dashboard/report?${params.toString()}`, { headers: { authorization: token } });
      setReport(res.data);
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const exportToExcel = () => {
    if (!report || report.donations.length === 0) {
      toast.error('No data to export');
      return;
    }
    const data = report.donations.map(d => ({
      'Receipt No': d.receipt_number,
      'Donor': d.donor_name,
      'Phone': d.phone_number,
      'Amount (GHS)': parseFloat(d.amount).toFixed(2),
      'Recipient': d.recipient_name,
      'Payment Method': d.payment_method,
      'Teller': d.teller_name,
      'Date': new Date(d.created_at).toLocaleString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations Report');
    XLSX.writeFile(workbook, `FDMS_Report_${Date.now()}.xlsx`);
    toast.success('Excel file downloaded!');
  };

  const exportToPDF = () => {
    if (!report || report.donations.length === 0) {
      toast.error('No data to export');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('FDMS Donation Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Donations: ${report.summary.total_count}  |  Total Amount: GHS ${parseFloat(report.summary.total_amount || 0).toFixed(2)}`, 14, 28);

    const tableData = report.donations.map(d => [
      d.receipt_number,
      d.donor_name,
      d.phone_number,
      `GHS ${parseFloat(d.amount).toFixed(2)}`,
      d.recipient_name,
      d.payment_method,
      d.teller_name,
      new Date(d.created_at).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['Receipt No', 'Donor', 'Phone', 'Amount', 'Recipient', 'Method', 'Teller', 'Date']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 60, 94] }
    });

    doc.save(`FDMS_Report_${Date.now()}.pdf`);
    toast.success('PDF file downloaded!');
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <h1 style={styles.pageTitle}>Reports</h1>

        <div style={styles.card}>
          <div style={styles.filterGrid}>
            <div>
              <label style={styles.label}>Funeral</label>
              <select style={styles.input} value={filters.funeral_id} onChange={(e) => setFilters({...filters, funeral_id: e.target.value})}>
                <option value="">All Funerals</option>
                {funerals.map(f => <option key={f.id} value={f.id}>{f.deceased_name}</option>)}
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
            <div>
              <label style={styles.label}>Payment Method</label>
              <select style={styles.input} value={filters.payment_method} onChange={(e) => setFilters({...filters, payment_method: e.target.value})}>
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <button style={styles.btn} onClick={generateReport}>Generate Report</button>
        </div>

        {report && (
          <>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <p style={styles.summaryLabel}>Total Donations</p>
                <h2 style={styles.summaryValue}>{report.summary.total_count}</h2>
              </div>
              <div style={styles.summaryCard}>
                <p style={styles.summaryLabel}>Total Amount</p>
                <h2 style={styles.summaryValue}>GHS {parseFloat(report.summary.total_amount || 0).toFixed(2)}</h2>
              </div>
            </div>

            <div style={styles.exportRow}>
              <button style={styles.excelBtn} onClick={exportToExcel}>📊 Export to Excel</button>
              <button style={styles.pdfBtn} onClick={exportToPDF}>📄 Export to PDF</button>
            </div>

            <div style={styles.card}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Receipt No</th>
                    <th style={styles.th}>Donor</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Recipient</th>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Teller</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {report.donations.map(d => (
                    <tr key={d.id}>
                      <td style={styles.td}>{d.receipt_number}</td>
                      <td style={styles.td}>{d.donor_name}</td>
                      <td style={styles.td}>GHS {parseFloat(d.amount).toFixed(2)}</td>
                      <td style={styles.td}>{d.recipient_name}</td>
                      <td style={styles.td}>{d.payment_method}</td>
                      <td style={styles.td}>{d.teller_name}</td>
                      <td style={styles.td}>{new Date(d.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%' },
  btn: { padding: '12px 24px', background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' },
  summaryCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  summaryLabel: { fontSize: '13px', color: '#666' },
  summaryValue: { fontSize: '26px', fontWeight: '700', color: '#1a3c5e', marginTop: '6px' },
  exportRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
  excelBtn: { padding: '12px 24px', background: '#1d6f42', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  pdfBtn: { padding: '12px 24px', background: '#c0392b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#444', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '12px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f0f0f0' },
};

export default Reports;