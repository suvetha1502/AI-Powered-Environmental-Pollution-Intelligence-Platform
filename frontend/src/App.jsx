import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import Dashboard from './components/Dashboard';
import Predictor from './components/Predictor';
import IndicesEngine from './components/IndicesEngine';
import DataIngestion from './components/DataIngestion';
import AlertsCenter from './components/AlertsCenter';
import ReportHub from './components/ReportHub';
import { 
  LayoutDashboard, Cpu, Calculator, PlusCircle, Bell, FileDown, 
  Activity, AlertOctagon, RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);
  const [apiOnline, setApiOnline] = useState(true);
  const [checkingApi, setCheckingApi] = useState(false);

  const checkStatusAndAlerts = async () => {
    setCheckingApi(true);
    try {
      const data = await apiService.getAlerts(false);
      setAlerts(data || []);
      setApiOnline(true);
    } catch (err) {
      console.error(err);
      setApiOnline(false);
    } finally {
      setCheckingApi(false);
    }
  };

  useEffect(() => {
    checkStatusAndAlerts();
    const interval = setInterval(checkStatusAndAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter(a => a.risk === 'Critical');

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside style={{
        background: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxShadow: '1px 0 0 #e2e8f0',
        height: '100vh',
        boxSizing: 'border-box',
        position: 'sticky',
        top: '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            borderRadius: '10px',
            padding: '8px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 'bold' }}>Pollution AI</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dashboard Portal</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'predictor', label: 'AI Forecasts', icon: Cpu },
            { id: 'indices', label: 'Indices Calculator', icon: Calculator },
            { id: 'ingestion', label: 'Import Data', icon: PlusCircle },
            { id: 'alerts', label: 'Alerts Log', icon: Bell, badgeCount: alerts.length },
            { id: 'reports', label: 'Reports Hub', icon: FileDown }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--accent-gradient)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: activeTab === tab.id ? '600' : '500',
                textAlign: 'left',
                fontSize: '13.5px'
              }}
              className="nav-button-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </div>
              {tab.badgeCount > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--risk-high)',
                  color: '#fff',
                  borderRadius: '99px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {tab.badgeCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{
          padding: '12px',
          background: '#f8f9fc',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>BACKEND STATUS</span>
            <span style={{ 
              color: apiOnline ? 'var(--risk-low)' : 'var(--risk-high)', 
              fontWeight: 'bold', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: apiOnline ? 'var(--risk-low)' : 'var(--risk-high)', display: 'inline-block' }}></span>
              {apiOnline ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <button 
            onClick={checkStatusAndAlerts}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '4px',
              marginTop: '4px',
              padding: '2px 0'
            }}
          >
            <RefreshCw size={10} className={checkingApi ? 'animate-spin' : ''} />
            <span>Sync Status</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowY: 'auto' }}>
        
        {/* Warning bar for critical alerts */}
        {criticalAlerts.length > 0 && (
          <div style={{
            background: 'var(--risk-critical)',
            color: '#fff',
            padding: '8px 24px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <AlertOctagon size={14} className="animate-pulse" />
            <span>
              <strong>CRITICAL WARNING:</strong> {criticalAlerts.length} pollution threshold breaches detected. Please check the alerts log.
            </span>
          </div>
        )}

        {/* Header */}
        <header style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'predictor' && 'AI Pollution Forecasts'}
              {activeTab === 'indices' && 'Calculated Pollution Indices'}
              {activeTab === 'ingestion' && 'Import Environmental Data'}
              {activeTab === 'alerts' && 'Active Alerts'}
              {activeTab === 'reports' && 'Reports Hub'}
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeTab === 'dashboard' && 'Environmental map, source tracking, and recent statistics.'}
              {activeTab === 'predictor' && 'Predict future pollution trends using Machine Learning (XGBoost/Random Forest).'}
              {activeTab === 'indices' && 'HPI, PLI, AQI, and other indices computed from raw parameter measurements.'}
              {activeTab === 'ingestion' && 'Add single records manually or import bulk data via CSV files.'}
              {activeTab === 'alerts' && 'Manage active environmental alerts and severity levels.'}
              {activeTab === 'reports' && 'Download automated PDF reports for policymakers.'}
            </span>
          </div>


        </header>

        {/* Viewport Content */}
        <div style={{ padding: '32px', flex: '1', boxSizing: 'border-box' }}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'predictor' && <Predictor />}
          {activeTab === 'indices' && <IndicesEngine />}
          {activeTab === 'ingestion' && <DataIngestion />}
          {activeTab === 'alerts' && <AlertsCenter />}
          {activeTab === 'reports' && <ReportHub />}
        </div>
      </main>
    </div>
  );
}
