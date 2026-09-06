import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  Calculator, Sparkles, ShieldAlert, Award, ArrowRight, Activity, Percent
} from 'lucide-react';

export default function IndicesEngine() {
  // Heavy Metal State
  const [location, setLocation] = useState('Zone A');
  const [arsenic, setArsenic] = useState(12.0);
  const [lead, setLead] = useState(25.0);
  const [cadmium, setCadmium] = useState(0.25);
  const [nickel, setNickel] = useState(38.0);
  const [metalResult, setMetalResult] = useState(null);
  const [metalLoading, setMetalLoading] = useState(false);
  const [metalError, setMetalError] = useState(null);

  // AQI State
  const [pm25, setPm25] = useState(55);
  const [pm10, setPm10] = useState(90);
  const [no2, setNo2] = useState(35);
  const [so2, setSo2] = useState(15);
  const [aqiResult, setAqiResult] = useState(null);

  // Noise State
  const [leq, setLeq] = useState(68);
  const [noiseResult, setNoiseResult] = useState(null);

  const [activeEngine, setActiveEngine] = useState('heavy_metal');

  const handleComputeMetal = async (e) => {
    e.preventDefault();
    setMetalLoading(true);
    setMetalError(null);
    try {
      const payload = {
        location,
        latitude: 13.08,
        longitude: 80.27,
        arsenic: parseFloat(arsenic),
        lead: parseFloat(lead),
        cadmium: parseFloat(cadmium),
        nickel: parseFloat(nickel),
        timestamp: new Date().toISOString()
      };
      const result = await apiService.computeIndices(payload);
      setMetalResult(result);
    } catch (err) {
      console.error(err);
      setMetalError('Computation failed. Please make sure the backend server is running.');
    } finally {
      setMetalLoading(false);
    }
  };

  const handleComputeAQI = (e) => {
    e.preventDefault();
    // PM2.5 standard: 60, PM10: 100, NO2: 80, SO2: 80
    const subPM25 = Math.min(500, (pm25 / 60) * 100);
    const subPM10 = Math.min(500, (pm10 / 100) * 100);
    const subNO2 = Math.min(500, (no2 / 80) * 100);
    const subSO2 = Math.min(500, (so2 / 80) * 100);
    const aqi = Math.max(subPM25, subPM10, subNO2, subSO2);
    
    let governing = 'PM2.5';
    if (aqi === subPM10) governing = 'PM10';
    else if (aqi === subNO2) governing = 'NO2';
    else if (aqi === subSO2) governing = 'SO2';

    let risk = 'Low';
    if (aqi >= 150) risk = 'Critical';
    else if (aqi >= 100) risk = 'High';
    else if (aqi >= 50) risk = 'Moderate';

    setAqiResult({
      aqi: parseFloat(aqi.toFixed(2)),
      governing,
      subIndices: { pm25: subPM25.toFixed(1), pm10: subPM10.toFixed(1), no2: subNO2.toFixed(1), so2: subSO2.toFixed(1) },
      risk_level: risk
    });
  };

  const handleComputeNoise = (e) => {
    e.preventDefault();
    const noiseIdx = leq - 55;
    let risk = 'Low';
    if (noiseIdx >= 20) risk = 'Critical';
    else if (noiseIdx >= 10) risk = 'High';
    else if (noiseIdx >= 0) risk = 'Moderate';

    setNoiseResult({
      noiseIndex: parseFloat(noiseIdx.toFixed(2)),
      risk_level: risk
    });
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return 'var(--risk-critical)';
      case 'High': return 'var(--risk-high)';
      case 'Moderate': return 'var(--risk-moderate)';
      default: return 'var(--risk-low)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Engine Switcher */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {['heavy_metal', 'aqi', 'noise'].map((engine) => (
          <button
            key={engine}
            onClick={() => setActiveEngine(engine)}
            className="btn-secondary"
            style={{
              background: activeEngine === engine ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
              border: activeEngine === engine ? 'none' : '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: '600'
            }}
          >
            {engine === 'heavy_metal' && 'Heavy Metals'}
            {engine === 'aqi' && 'Air Quality (AQI)'}
            {engine === 'noise' && 'Noise Index'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }} className="engine-grid">
        
        {/* Left Side: Parameters Input Form */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Calculator size={20} style={{ color: 'var(--accent-cyan)' }} />
            Parameters
          </h3>

          {activeEngine === 'heavy_metal' && (
            <form onSubmit={handleComputeMetal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="Zone A">Zone A</option>
                  <option value="Zone B">Zone B</option>
                  <option value="Zone C">Zone C</option>
                  <option value="Zone D">Zone D</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Arsenic (mg/kg - Standard: 15)</label>
                <input type="number" step="0.01" className="form-input" value={arsenic} onChange={(e) => setArsenic(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Lead (mg/kg - Standard: 35)</label>
                <input type="number" step="0.01" className="form-input" value={lead} onChange={(e) => setLead(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cadmium (mg/kg - Standard: 0.3)</label>
                <input type="number" step="0.01" className="form-input" value={cadmium} onChange={(e) => setCadmium(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nickel (mg/kg - Standard: 50)</label>
                <input type="number" step="0.01" className="form-input" value={nickel} onChange={(e) => setNickel(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={metalLoading} style={{ justifyContent: 'center', marginTop: '8px' }}>
                {metalLoading ? 'Calculating...' : 'Calculate Indices'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {activeEngine === 'aqi' && (
            <form onSubmit={handleComputeAQI} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">PM2.5 (µg/m³ - Standard: 60)</label>
                <input type="number" className="form-input" value={pm25} onChange={(e) => setPm25(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">PM10 (µg/m³ - Standard: 100)</label>
                <input type="number" className="form-input" value={pm10} onChange={(e) => setPm10(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">NO2 (µg/m³ - Standard: 80)</label>
                <input type="number" className="form-input" value={no2} onChange={(e) => setNo2(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">SO2 (µg/m³ - Standard: 80)</label>
                <input type="number" className="form-input" value={so2} onChange={(e) => setSo2(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                Calculate AQI
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {activeEngine === 'noise' && (
            <form onSubmit={handleComputeNoise} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Sound Level (dB - Limit: 55)</label>
                <input type="number" className="form-input" value={leq} onChange={(e) => setLeq(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '8px' }}>
                Calculate Noise Index
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {metalError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px' }}>
              {metalError}
            </div>
          )}
        </div>

        {/* Right Side: Index Results Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {activeEngine === 'heavy_metal' && metalResult && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', color: '#fff' }}>Soil & Heavy Metals Indices</h4>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Location: {metalResult.location}</span>
                </div>
                <span className={`badge badge-${metalResult.risk_level.toLowerCase()}`} style={{ height: 'fit-content' }}>
                  {metalResult.risk_level} Risk
                </span>
              </div>

              {/* HPI / MI / PLI Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>HEAVY POLLUTION INDEX (HPI)</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-cyan)', margin: '8px 0' }}>{metalResult.HPI}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Safe threshold: &lt; 30</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>METAL INDEX (MI)</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-purple)', margin: '8px 0' }}>{metalResult.MI}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Safe threshold: &lt; 1</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>POLLUTION LOAD INDEX (PLI)</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--risk-moderate)', margin: '8px 0' }}>{metalResult.PLI}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PLI &gt; 1 = Contaminated</div>
                </div>
              </div>

              {/* Contamination Factors */}
              <div>
                <h5 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={14} style={{ color: 'var(--accent-cyan)' }} />
                  Contamination Factors (CF)
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(metalResult.CF || {}).map(([metal, cf]) => (
                    <div key={metal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{metal}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, cf * 25)}%`, height: '100%', background: cf > 2 ? 'var(--risk-high)' : cf > 1 ? 'var(--risk-moderate)' : 'var(--risk-low)' }}></div>
                        </div>
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{cf}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geo-accumulation Indexes */}
              <div>
                <h5 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} style={{ color: 'var(--accent-purple)' }} />
                  Geo-accumulation Index (Igeo)
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {Object.entries(metalResult.Igeo || {}).map(([metal, igeo]) => (
                    <div key={metal} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <div style={{ textTransform: 'capitalize', fontSize: '12px', color: 'var(--text-secondary)' }}>{metal}</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0' }}>{igeo}</div>
                      <span style={{ fontSize: '11px', color: igeo <= 0 ? 'var(--risk-low)' : igeo <= 3 ? 'var(--risk-moderate)' : 'var(--risk-high)' }}>
                        {igeo <= 0 ? 'Unpolluted' : igeo <= 3 ? 'Moderately Polluted' : 'Strongly Polluted'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeEngine === 'aqi' && aqiResult && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', color: '#fff' }}>Air Quality Index</h4>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Governing Pollutant: <strong style={{ color: '#fff' }}>{aqiResult.governing}</strong></span>
                </div>
                <span className={`badge badge-${aqiResult.risk_level.toLowerCase()}`} style={{ height: 'fit-content' }}>
                  {aqiResult.risk_level} Risk
                </span>
              </div>

              {/* AQI Score Indicator */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>AIR QUALITY INDEX (AQI)</div>
                <div style={{ fontSize: '54px', fontWeight: '800', color: getRiskColor(aqiResult.risk_level), margin: '10px 0' }}>{aqiResult.aqi}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Governed by the highest sub-index concentration.</div>
              </div>

              {/* Sub-Indices */}
              <div>
                <h5 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Sub-Indices</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PM2.5</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{aqiResult.subIndices.pm25}</strong>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>PM10</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{aqiResult.subIndices.pm10}</strong>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>NO2</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{aqiResult.subIndices.no2}</strong>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>SO2</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{aqiResult.subIndices.so2}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeEngine === 'noise' && noiseResult && (
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', color: '#fff' }}>Noise Index</h4>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Relative to residential standard (55 dB)</span>
                </div>
                <span className={`badge badge-${noiseResult.risk_level.toLowerCase()}`} style={{ height: 'fit-content' }}>
                  {noiseResult.risk_level} Risk
                </span>
              </div>

              {/* Noise Index Excursion */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>DECIBEL EXCURSION</div>
                <div style={{ fontSize: '54px', fontWeight: '800', color: getRiskColor(noiseResult.risk_level), margin: '10px 0' }}>
                  {noiseResult.noiseIndex > 0 ? `+${noiseResult.noiseIndex}` : noiseResult.noiseIndex} dB
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {noiseResult.noiseIndex > 0 
                    ? `Exceeds the limit by ${noiseResult.noiseIndex} dB.` 
                    : `Within acceptable safety limits.`}
                </div>
              </div>
            </div>
          )}

          {/* Awaiting input state */}
          {((activeEngine === 'heavy_metal' && !metalResult) || 
            (activeEngine === 'aqi' && !aqiResult) || 
            (activeEngine === 'noise' && !noiseResult)) && (
            <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '1', gap: '16px', border: '1px dashed var(--border-color)' }}>
              <Calculator size={48} style={{ color: 'var(--text-muted)' }} />
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Indices Calculator</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '380px' }}>
                  Enter environmental parameter values on the left to compute indices and evaluate risk levels.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
