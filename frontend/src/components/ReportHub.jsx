import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  FileText, Download, ShieldAlert, CheckCircle, RefreshCw, FileCheck, Landmark
} from 'lucide-react';

export default function ReportHub() {
  const [location, setLocation] = useState('Zone A');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [recentDownloads, setRecentDownloads] = useState([]);

  const handleDownload = async (e) => {
    e.preventDefault();
    setDownloading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = apiService.getReportDownloadUrl(location);
      
      // Standard browser download trigger
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `environmental_report_${location}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(true);
      
      // Update recent downloads list
      const timestamp = new Date().toLocaleTimeString();
      setRecentDownloads([{
        location,
        timestamp,
        format: 'PDF Document',
        size: '15.4 KB'
      }, ...recentDownloads]);

      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setError('Report compilation triggered a server error. Verify PDF engine (ReportLab) availability.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fadeIn 0.5s ease-out' }} className="report-grid">
      
      {/* Parameters Selection Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
          Report Compilation Node
        </h3>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Compile real-time pollution metrics, AI prediction arrays, heavy metal diagnostics, and spatial GIS hotspot correlations into policymaker-ready compliance PDFs.
        </p>

        <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Target Area Jurisdiction</label>
            <select className="form-select" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="Zone A">Zone A (Industrial District)</option>
              <option value="Zone B">Zone B (River Basin Watershed)</option>
              <option value="Zone C">Zone C (Mining & Excavation)</option>
              <option value="Zone D">Zone D (Residential Sector)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Document Standard & Compliance</label>
            <select className="form-select" defaultValue="cpcb">
              <option value="cpcb">CPCB Environmental Safety Standard (India)</option>
              <option value="who">WHO Clean Air & Water Directive</option>
              <option value="un">SDG Goal Progress Compliance Assessment</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={downloading} style={{ justifyContent: 'center', marginTop: '12px' }}>
            {downloading ? 'Compiling PDF Template...' : 'Download Environmental PDF Report'}
            <Download size={16} />
          </button>
        </form>

        {success && (
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle size={16} />
            <span>PDF report download dispatched successfully. Check your browser downloads folder.</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Mock Document Preview and History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Document Mockup View */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', background: 'linear-gradient(135deg, rgba(22, 28, 45, 0.6) 0%, rgba(10, 14, 26, 0.8) 100%)' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '20px', borderRadius: '12px', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 242, 254, 0.15)', boxShadow: '0 0 20px rgba(0, 242, 254, 0.05)' }}>
            <FileCheck size={48} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>DOCUMENT PROFILE PREVIEW</div>
            <h4 style={{ color: '#fff', fontSize: '15px', marginTop: '2px', marginBottom: '4px' }}>Environmental Pollution Intelligence Report</h4>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>Location: <strong style={{ color: '#fff' }}>{location}</strong></span>
              <span>Classification: <strong style={{ color: 'var(--risk-high)' }}>High Risk Alert</strong></span>
              <span>Security Hash: <strong style={{ color: 'var(--text-muted)' }}>SHA-256 Validated</strong></span>
            </div>
          </div>
        </div>

        {/* Recently Compiled List */}
        <div className="glass-panel" style={{ padding: '20px', flex: '1' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={16} style={{ color: 'var(--accent-purple)' }} />
            Session Compilation Registry
          </h3>

          {recentDownloads.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', fontSize: '12px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              No documents compiled during this dashboard session.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentDownloads.map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>report_{doc.location}.pdf</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generated at {doc.timestamp} | {doc.format}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{doc.size}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
