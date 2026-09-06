import React, { useState } from 'react';
import { apiService } from '../services/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Cpu, Calendar, BarChart2, ShieldAlert, Sparkles, ChevronRight
} from 'lucide-react';

export default function Predictor() {
  const [location, setLocation] = useState('Zone A');
  const [pollutionType, setPollutionType] = useState('air');
  const [currentValue, setCurrentValue] = useState(65.0);
  const [forecastDays, setForecastDays] = useState(7);
  const [modelType, setModelType] = useState('xgb');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleForecast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        location,
        pollution_type: pollutionType,
        features: {
          current_value: parseFloat(currentValue),
          model_type: modelType
        },
        forecast_days: parseInt(forecastDays)
      };
      
      const data = await apiService.getForecast(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('AI prediction forecast request failed. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Critical': return 'var(--risk-critical)';
      case 'High': return 'var(--risk-high)';
      case 'Moderate': return 'var(--risk-moderate)';
      default: return 'var(--risk-low)';
    }
  };

  // Add lower and upper confidence bounds for charting
  const chartData = result?.forecast.map(item => {
    const val = item.value;
    const confidenceGap = val * (1 - result.confidence) * 0.6;
    return {
      day: new Date(item.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: val,
      lowerBound: parseFloat((val - confidenceGap).toFixed(2)),
      upperBound: parseFloat((val + confidenceGap).toFixed(2)),
    };
  }) || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }} className="predictor-grid">
      
      {/* Configuration Column */}
      <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Cpu size={20} style={{ color: 'var(--accent-cyan)' }} />
          Pollution Forecaster
        </h3>

        <form onSubmit={handleForecast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Location</label>
            <select className="form-select" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="Zone A">Zone A (Industrial)</option>
              <option value="Zone B">Zone B (River Basin)</option>
              <option value="Zone C">Zone C (Mining Area)</option>
              <option value="Zone D">Zone D (Residential)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pollution Type</label>
            <select className="form-select" value={pollutionType} onChange={(e) => setPollutionType(e.target.value)}>
              <option value="air">Air Quality (PM2.5)</option>
              <option value="water">Water Quality (Lead/pH)</option>
              <option value="soil">Soil Quality (Toxicity)</option>
              <option value="noise">Noise Levels (dB)</option>
              <option value="heavy_metal">Heavy Metals Index</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Current Value</label>
            <input 
              type="number" 
              className="form-input" 
              value={currentValue} 
              onChange={(e) => setCurrentValue(e.target.value)} 
              step="0.1" 
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Forecast Horizon</label>
            <select className="form-select" value={forecastDays} onChange={(e) => setForecastDays(e.target.value)}>
              <option value="7">7 Days</option>
              <option value="10">10 Days</option>
              <option value="14">14 Days</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Machine Learning Model</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', flex: '1', padding: '10px', background: modelType === 'xgb' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${modelType === 'xgb' ? 'var(--accent-cyan)' : 'var(--border-color)'}`, borderRadius: '8px' }}>
                <input type="radio" name="model" value="xgb" checked={modelType === 'xgb'} onChange={() => setModelType('xgb')} style={{ accentColor: 'var(--accent-cyan)' }} />
                XGBoost
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', flex: '1', padding: '10px', background: modelType === 'rf' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${modelType === 'rf' ? 'var(--accent-cyan)' : 'var(--border-color)'}`, borderRadius: '8px' }}>
                <input type="radio" name="model" value="rf" checked={modelType === 'rf'} onChange={() => setModelType('rf')} style={{ accentColor: 'var(--accent-cyan)' }} />
                Random Forest
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '8px' }}>
            {loading ? 'Running forecast...' : 'Generate Forecast'}
            <ChevronRight size={16} />
          </button>
        </form>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Chart Output Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {result ? (
          <>
            {/* Forecast Risk Summary */}
            <div className="glass-panel" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderLeft: `4px solid ${getRiskColor(result.risk_level)}` }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>RISK LEVEL</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getRiskColor(result.risk_level), display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <ShieldAlert size={24} />
                  {result.risk_level}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>CONFIDENCE</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Sparkles size={22} style={{ color: 'var(--accent-cyan)' }} />
                  {(result.confidence * 100).toFixed(0)}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ACTIVE ML MODEL</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '8px', textTransform: 'uppercase' }}>
                  {modelType === 'xgb' ? 'XGBoost Regressor' : 'Random Forest'}
                </div>
              </div>
            </div>

            {/* Line Chart Grid */}
            <div className="glass-panel" style={{ padding: '24px', flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
                Forecasted Pollution Trends
              </h3>

              <div style={{ width: '100%', height: '280px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#11182b', border: '1px solid var(--border-color)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#confidenceGrad)" name="Upper Bound" />
                    <Area type="monotone" dataKey="lowerBound" stroke="none" fill="url(#confidenceGrad)" name="Lower Bound" />
                    <Line type="monotone" dataKey="value" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} name="Predicted Average" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: '1', gap: '16px', border: '1px dashed var(--border-color)' }}>
            <Cpu size={48} style={{ color: 'var(--text-muted)' }} />
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Awaiting Parameters</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '380px' }}>
                Select the location, category, and parameters on the left to generate the forecast trend lines.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
