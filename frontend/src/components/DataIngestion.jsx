import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  Database, UploadCloud, CheckCircle2, ShieldAlert, Plus, Trash2, ArrowRight
} from 'lucide-react';

export default function DataIngestion() {
  // Single Record Form State
  const [location, setLocation] = useState('Zone A');
  const [latitude, setLatitude] = useState(13.08);
  const [longitude, setLongitude] = useState(80.27);
  const [pollutionType, setPollutionType] = useState('air');
  const [source, setSource] = useState('Gov Sensor Node A');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().substring(0, 16));

  // Dynamic parameters state depending on type
  const [airParams, setAirParams] = useState({ pm25: 45, pm10: 80, no2: 25, so2: 12 });
  const [waterParams, setWaterParams] = useState({ pH: 7.2, dissolved_oxygen: 6.8, turbidity: 3.5 });
  const [soilParams, setSoilParams] = useState({ ph: 6.5, organic_matter: 4.2 });
  const [noiseParams, setNoiseParams] = useState({ leq: 62 });
  const [metalParams, setMetalParams] = useState({ arsenic: 8.5, lead: 12.0, cadmium: 0.15, nickel: 22.4 });

  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);
  const [ingestError, setIngestError] = useState(null);

  // CSV Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState(null);

  const handleIngestSubmit = async (e) => {
    e.preventDefault();
    setIngestLoading(true);
    setIngestSuccess(false);
    setIngestError(null);

    let parameters = {};
    if (pollutionType === 'air') parameters = airParams;
    else if (pollutionType === 'water') parameters = waterParams;
    else if (pollutionType === 'soil') parameters = soilParams;
    else if (pollutionType === 'noise') parameters = noiseParams;
    else if (pollutionType === 'heavy_metal') parameters = metalParams;

    const payload = {
      location,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pollution_type: pollutionType,
      parameters,
      timestamp: new Date(timestamp).toISOString(),
      source
    };

    try {
      await apiService.ingestPollution(payload);
      setIngestSuccess(true);
      setTimeout(() => setIngestSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setIngestError('Ingestion failed. Please check parameters and try again.');
    } finally {
      setIngestLoading(false);
    }
  };

  const handleCSVUpload = async (file) => {
    if (!file) return;
    setCsvLoading(true);
    setCsvError(null);
    setCsvPreview(null);
    try {
      const data = await apiService.uploadCSV(file);
      setCsvPreview(data);
      setCsvFile(file);
    } catch (err) {
      console.error(err);
      setCsvError('Failed to parse CSV file. Ensure valid CSV headers and formats.');
    } finally {
      setCsvLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCSVUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleCSVUpload(e.target.files[0]);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="ingestion-grid">
      
      {/* Manual Form Column */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Plus size={20} style={{ color: 'var(--accent-cyan)' }} />
          Add Pollution Record
        </h3>

        <form onSubmit={handleIngestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Data Source</label>
              <input type="text" className="form-input" value={source} onChange={(e) => setSource(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input type="number" step="0.0001" className="form-input" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input type="number" step="0.0001" className="form-input" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={pollutionType} onChange={(e) => setPollutionType(e.target.value)}>
                <option value="air">Air Quality</option>
                <option value="water">Water Quality</option>
                <option value="soil">Soil Quality</option>
                <option value="noise">Noise</option>
                <option value="heavy_metal">Heavy Metals</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Timestamp</label>
              <input type="datetime-local" className="form-input" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} required />
            </div>
          </div>

          {/* Dynamic parameter lists */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '12px' }}>
              PARAMETERS
            </div>

            {pollutionType === 'air' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">PM2.5 (µg/m³)</label>
                  <input type="number" className="form-input" value={airParams.pm25} onChange={(e) => setAirParams({...airParams, pm25: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">PM10 (µg/m³)</label>
                  <input type="number" className="form-input" value={airParams.pm10} onChange={(e) => setAirParams({...airParams, pm10: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">NO2 (µg/m³)</label>
                  <input type="number" className="form-input" value={airParams.no2} onChange={(e) => setAirParams({...airParams, no2: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">SO2 (µg/m³)</label>
                  <input type="number" className="form-input" value={airParams.so2} onChange={(e) => setAirParams({...airParams, so2: parseFloat(e.target.value)})} />
                </div>
              </div>
            )}

            {pollutionType === 'water' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">pH</label>
                  <input type="number" step="0.1" className="form-input" value={waterParams.pH} onChange={(e) => setWaterParams({...waterParams, pH: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Oxygen DO (mg/L)</label>
                  <input type="number" step="0.1" className="form-input" value={waterParams.dissolved_oxygen} onChange={(e) => setWaterParams({...waterParams, dissolved_oxygen: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Turbidity (NTU)</label>
                  <input type="number" step="0.1" className="form-input" value={waterParams.turbidity} onChange={(e) => setWaterParams({...waterParams, turbidity: parseFloat(e.target.value)})} />
                </div>
              </div>
            )}

            {pollutionType === 'soil' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">pH</label>
                  <input type="number" step="0.1" className="form-input" value={soilParams.ph} onChange={(e) => setSoilParams({...soilParams, ph: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Organic Matter (%)</label>
                  <input type="number" step="0.1" className="form-input" value={soilParams.organic_matter} onChange={(e) => setSoilParams({...soilParams, organic_matter: parseFloat(e.target.value)})} />
                </div>
              </div>
            )}

            {pollutionType === 'noise' && (
              <div className="form-group">
                <label className="form-label">Leq Level (dB)</label>
                <input type="number" className="form-input" value={noiseParams.leq} onChange={(e) => setNoiseParams({leq: parseFloat(e.target.value)})} />
              </div>
            )}

            {pollutionType === 'heavy_metal' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Arsenic (mg/kg)</label>
                  <input type="number" step="0.01" className="form-input" value={metalParams.arsenic} onChange={(e) => setMetalParams({...metalParams, arsenic: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lead (mg/kg)</label>
                  <input type="number" step="0.01" className="form-input" value={metalParams.lead} onChange={(e) => setMetalParams({...metalParams, lead: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cadmium (mg/kg)</label>
                  <input type="number" step="0.01" className="form-input" value={metalParams.cadmium} onChange={(e) => setMetalParams({...metalParams, cadmium: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nickel (mg/kg)</label>
                  <input type="number" step="0.01" className="form-input" value={metalParams.nickel} onChange={(e) => setMetalParams({...metalParams, nickel: parseFloat(e.target.value)})} />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={ingestLoading} style={{ justifyContent: 'center', marginTop: '10px' }}>
            {ingestLoading ? 'Saving record...' : 'Save Record'}
            <ArrowRight size={16} />
          </button>
        </form>

        {ingestSuccess && (
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle2 size={16} />
            <span>Pollution record added successfully.</span>
          </div>
        )}

        {ingestError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} />
            <span>{ingestError}</span>
          </div>
        )}
      </div>

      {/* CSV Bulk Ingest Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <UploadCloud size={20} style={{ color: 'var(--accent-purple)' }} />
            Bulk Import (CSV)
          </h3>

          <div 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag} 
            onDragLeave={handleDrag} 
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              background: dragActive ? 'rgba(0, 242, 254, 0.05)' : 'rgba(10, 14, 26, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            <input 
              id="csv-file-input" 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
            <UploadCloud size={40} style={{ color: dragActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
            <div>
              <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '4px' }}>Drag and drop CSV files here</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select or drag a CSV file containing pollution data</p>
            </div>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              Choose File
            </span>
          </div>

          {csvLoading && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', margin: '20px 0' }}>
              Uploading and parsing file...
            </div>
          )}

          {csvError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShieldAlert size={16} />
              <span>{csvError}</span>
            </div>
          )}

          {/* Import Data Preview */}
          {csvPreview && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-cyan)' }}>
                  <CheckCircle2 size={16} />
                  <span>Successfully parsed <strong>{csvPreview.rows} rows</strong> and <strong>{csvPreview.columns.length} columns</strong>.</span>
                </div>
                <button 
                  onClick={() => { setCsvPreview(null); setCsvFile(null); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>COLUMNS DETECTED</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {csvPreview.columns.map((col, idx) => (
                  <span key={idx} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {col}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold' }}>DATA PREVIEW</div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', maxHeight: '180px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', background: 'rgba(0,0,0,0.1)' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                      {csvPreview.columns.map((col, idx) => (
                        <th key={`th-${idx}`} style={{ padding: '8px', color: 'var(--text-secondary)' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.preview.map((row, rowIdx) => (
                      <tr key={`row-${rowIdx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        {csvPreview.columns.map((col, colIdx) => (
                          <td key={`td-${rowIdx}-${colIdx}`} style={{ padding: '6px 8px' }}>
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
