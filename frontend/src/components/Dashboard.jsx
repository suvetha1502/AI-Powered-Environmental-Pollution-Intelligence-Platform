import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import { 
  Activity, AlertTriangle, ShieldAlert, MapPin, Database, RefreshCw, Layers, Radio
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [sources, setSources] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hotspotsData, sourcesData, recordsData] = await Promise.all([
        apiService.getHotspots(),
        apiService.getSources(),
        apiService.getRecords()
      ]);
      setHotspots(hotspotsData.features || []);
      setSources(sourcesData || []);
      setRecords(recordsData || []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Please make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map latitude/longitude coordinates to SVG pixel coordinates (600x400 map size)
  const mapCoords = (lat, lon) => {
    const minLat = 12.98, maxLat = 13.16;
    const minLon = 80.15, maxLon = 80.35;
    const x = ((lon - minLon) / (maxLon - minLon)) * 600;
    const y = 400 - ((lat - minLat) / (maxLat - minLat)) * 400;
    return { x, y };
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'var(--risk-critical)';
      case 'high': return 'var(--risk-high)';
      case 'moderate': return 'var(--risk-moderate)';
      default: return 'var(--risk-low)';
    }
  };

  // Group stats by pollutant domain
  const getStats = () => {
    const stats = { air: 0, water: 0, soil: 0, noise: 0, metal: 0 };
    records.forEach(r => {
      if (r.pollution_type === 'air') stats.air++;
      else if (r.pollution_type === 'water') stats.water++;
      else if (r.pollution_type === 'soil') stats.soil++;
      else if (r.pollution_type === 'noise') stats.noise++;
      else if (r.pollution_type === 'heavy_metal') stats.metal++;
    });
    return stats;
  };

  const stats = getStats();
  const filteredRecords = activeTab === 'all' 
    ? records 
    : records.filter(r => r.pollution_type === activeTab);

  // Group AQI and HPI data by location for charts
  const chartData = Object.values(
    records.reduce((acc, curr) => {
      const loc = curr.location;
      if (!acc[loc]) {
        acc[loc] = { name: loc, AQI: 0, HPI: 0, count: 0 };
      }
      acc[loc].count++;
      if (curr.parameters?.AQI) acc[loc].AQI += curr.parameters.AQI;
      if (curr.parameters?.HPI) acc[loc].HPI += curr.parameters.HPI;
      return acc;
    }, {})
  ).map(item => ({
    ...item,
    AQI: item.AQI ? Math.round(item.AQI / item.count) : undefined,
    HPI: item.HPI ? Math.round(item.HPI / item.count) : undefined,
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--accent-cyan)', animation: 'spin 1.5s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-cyan)' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{records.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Total Records</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--risk-high)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{hotspots.filter(h => h.properties.risk === 'Critical' || h.properties.risk === 'High').length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Active Hotspots</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(161, 140, 209, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--accent-purple)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{sources.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Pollution Sources</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Map & Proximity Split Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }} className="dashboard-grid">
        
        {/* SVG Interactive GIS Map */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--accent-cyan)' }} />
              GIS Hotspots Map
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Region: Chennai</span>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '400px', background: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
              {/* Decorative high-tech rings and grids */}
              <circle cx="300" cy="200" r="80" stroke="rgba(59, 130, 246, 0.08)" fill="none" />
              <circle cx="300" cy="200" r="160" stroke="rgba(59, 130, 246, 0.08)" fill="none" />
              
              <line x1="300" y1="0" x2="300" y2="400" stroke="rgba(0,0,0,0.04)" />
              <line x1="0" y1="200" x2="600" y2="200" stroke="rgba(0,0,0,0.04)" />

              {/* Selected source impact radius overlay */}
              {selectedSource && (() => {
                const { x, y } = mapCoords(selectedSource.lat, selectedSource.lon);
                const r = selectedSource.impact_radius_km * 12; // Visual scaling factor
                return (
                  <>
                    <circle cx={x} cy={y} r={r} fill="rgba(239, 68, 68, 0.07)" stroke="var(--risk-high)" strokeDasharray="3, 3" />
                  </>
                );
              })()}

              {/* Render Hotspots */}
              {hotspots.map((h, i) => {
                const [lon, lat] = h.geometry.coordinates;
                const { x, y } = mapCoords(lat, lon);
                const isSelected = selectedHotspot?.properties.name === h.properties.name;
                const color = getRiskColor(h.properties.risk);
                return (
                  <g key={`hotspot-${i}`} onClick={() => { setSelectedHotspot(h); setSelectedSource(null); }} style={{ cursor: 'pointer' }}>
                    <circle cx={x} cy={y} r={isSelected ? 14 : 9} fill="transparent" stroke={color} strokeWidth="1.5" />
                    <circle cx={x} cy={y} r={isSelected ? 6 : 4} fill={color} />
                  </g>
                );
              })}

              {/* Render Pollution Sources */}
              {sources.map((s, i) => {
                const { x, y } = mapCoords(s.lat, s.lon);
                const isSelected = selectedSource?.id === s.id;
                return (
                  <g key={`source-${i}`} onClick={() => { setSelectedSource(s); setSelectedHotspot(null); }} style={{ cursor: 'pointer' }}>
                    <polygon points={`${x},${y - 9} ${x - 8},${y + 7} ${x + 8},${y + 7}`} fill={isSelected ? 'var(--risk-high)' : '#64748b'} stroke="#fff" strokeWidth="1" />
                    <circle cx={x} cy={y} r={2} fill="#fff" />
                  </g>
                );
              })}
            </svg>

            {/* Selected Marker Detail Overlay */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', padding: '12px', background: 'rgba(255,255,255,0.95)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }}>
              {!selectedHotspot && !selectedSource ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Radio size={14} className="animate-pulse" style={{ color: 'var(--accent-cyan)' }} />
                  <span>Click on map markers to view hotspot detail or source impact radius.</span>
                </div>
              ) : selectedHotspot ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedHotspot.properties.name}</span>
                    <span className={`badge badge-${selectedHotspot.properties.risk.toLowerCase()}`}>{selectedHotspot.properties.risk} Risk</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div>Pollutant: <strong style={{ color: 'var(--text-primary)' }}>{selectedHotspot.properties.pollutant}</strong></div>
                    <div>Value: <strong style={{ color: 'var(--text-primary)' }}>{selectedHotspot.properties.value}</strong></div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{selectedSource.name}</span>
                    <span className="badge badge-high" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>Source</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div>Category: <strong style={{ color: 'var(--text-primary)' }}>{selectedSource.type.toUpperCase()}</strong></div>
                    <div>Impact Radius: <strong style={{ color: 'var(--text-primary)' }}>{selectedSource.impact_radius_km} km</strong></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proximity Analysis & Stats Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '20px', flex: '1' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Radio size={16} style={{ color: 'var(--risk-high)' }} />
              Trace Source Proximity
            </h3>
            
            {selectedSource ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Showing hotspots within a <strong>{selectedSource.impact_radius_km} km</strong> radius of the <strong>{selectedSource.name}</strong>.
                </p>
                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>AFFECTED HOTSPOTS IN RANGE</div>
                  
                  {hotspots.filter(h => {
                    const [lon, lat] = h.geometry.coordinates;
                    const dx = (lon - selectedSource.lon) * 111;
                    const dy = (lat - selectedSource.lat) * 111;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    return dist <= selectedSource.impact_radius_km;
                  }).length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hotspots detected in this radius.</div>
                  ) : (
                    <ul style={{ paddingLeft: '16px', margin: '0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {hotspots.filter(h => {
                        const [lon, lat] = h.geometry.coordinates;
                        const dx = (lon - selectedSource.lon) * 111;
                        const dy = (lat - selectedSource.lat) * 111;
                        h.distance = Math.sqrt(dx*dx + dy*dy);
                        return h.distance <= selectedSource.impact_radius_km;
                      }).map((h, index) => (
                        <li key={`prox-${index}`}>
                          {h.properties.name} ({h.distance.toFixed(1)} km) - 
                          <span style={{ color: getRiskColor(h.properties.risk), marginLeft: '4px', fontWeight: 'bold' }}>
                            {h.properties.risk}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : selectedHotspot ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Correlating nearby industrial sources for <strong>{selectedHotspot.properties.name}</strong>.
                </p>
                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>PROXIMITY CORRELATIONS</div>
                  <ul style={{ paddingLeft: '16px', margin: '0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {sources.map((s, index) => {
                      const [lon, lat] = selectedHotspot.geometry.coordinates;
                      const dx = (s.lon - lon) * 111;
                      const dy = (s.lat - lat) * 111;
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      return { ...s, dist };
                    }).sort((a,b) => a.dist - b.dist).map((s, idx) => (
                      <li key={`src-prox-${idx}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{s.name} ({s.type})</span>
                        <span style={{ color: s.dist <= s.impact_radius_km ? 'var(--risk-high)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                          {s.dist.toFixed(1)} km
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                Select a marker on the map to trace proximity.
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '20px', flex: '1', minHeight: '200px' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
              Zone Index Scores
            </h3>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    <Legend iconSize={10} />
                    <Bar dataKey="AQI" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="HPI" fill="var(--accent-purple)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No index data available. Please ingest data first.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Pollution Database Directory */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
            Pollution Database
          </h3>

          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['all', 'air', 'water', 'soil', 'noise', 'heavy_metal'].map((t) => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: activeTab === t ? '#ffffff' : 'transparent',
                  border: activeTab === t ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: activeTab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                {t === 'heavy_metal' ? 'Heavy Metal' : t}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '140px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            No records found matching this category.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px' }}>ID</th>
                  <th style={{ padding: '12px 8px' }}>Location</th>
                  <th style={{ padding: '12px 8px' }}>Coordinates</th>
                  <th style={{ padding: '12px 8px' }}>Type</th>
                  <th style={{ padding: '12px 8px' }}>Parameters</th>
                  <th style={{ padding: '12px 8px' }}>Source Node</th>
                  <th style={{ padding: '12px 8px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, index) => (
                  <tr key={`rec-${index}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{rec.id || (index + 1)}</td>
                    <td style={{ padding: '10px 8px' }}>{rec.location}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span className="badge badge-low" style={{ background: rec.pollution_type === 'heavy_metal' ? 'rgba(161, 140, 209, 0.15)' : 'rgba(0, 242, 254, 0.15)', color: rec.pollution_type === 'heavy_metal' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                        {rec.pollution_type}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={JSON.stringify(rec.parameters)}>
                      {JSON.stringify(rec.parameters)}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{rec.source || 'Manual Entry'}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{new Date(rec.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
