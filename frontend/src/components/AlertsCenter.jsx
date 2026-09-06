import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  Bell, BellOff, ShieldAlert, CheckCircle, RefreshCw, MapPin, Calendar, Clock
} from 'lucide-react';

export default function AlertsCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, acknowledged

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve active alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await apiService.acknowledgeAlert(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    } catch (err) {
      console.error(err);
      alert('Could not acknowledge alert.');
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

  const getRiskBg = (risk) => {
    switch (risk) {
      case 'Critical': return 'rgba(217, 70, 239, 0.05)';
      case 'High': return 'rgba(239, 68, 68, 0.05)';
      case 'Moderate': return 'rgba(245, 158, 11, 0.05)';
      default: return 'rgba(0, 242, 254, 0.05)';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return !a.acknowledged;
    if (filter === 'acknowledged') return a.acknowledged;
    return true;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
            <Bell size={22} style={{ color: 'var(--risk-high)' }} />
            Active Pollution Alerts
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage active warnings and severity thresholds.</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={fetchAlerts}
            className="btn-secondary"
            style={{ padding: '8px 12px' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['all', 'active', 'acknowledged'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-high)', color: 'var(--risk-high)', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--text-secondary)' }}>
          Syncing alerts...
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '16px', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
          <BellOff size={48} style={{ color: 'var(--text-muted)' }} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#fff', marginBottom: '4px' }}>No Active Alerts</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>There are currently no active pollution alerts.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className="glass-panel"
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: getRiskBg(alert.risk),
                borderLeft: `4px solid ${getRiskColor(alert.risk)}`,
                opacity: alert.acknowledged ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge badge-${alert.risk.toLowerCase()}`}>
                    {alert.risk}
                  </span>
                  <span style={{ fontWeight: '600', color: '#fff', fontSize: '15px' }}>{alert.message}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    {alert.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {new Date(alert.timestamp).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div>
                {alert.acknowledged ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={16} style={{ color: 'var(--risk-low)' }} />
                    Acknowledged
                  </span>
                ) : (
                  <button 
                    onClick={() => handleAcknowledge(alert.id)}
                    className="btn-primary"
                    style={{
                      background: 'none',
                      border: `1px solid ${getRiskColor(alert.risk)}`,
                      color: getRiskColor(alert.risk),
                      padding: '6px 14px',
                      fontSize: '12px',
                      borderRadius: '6px'
                    }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
