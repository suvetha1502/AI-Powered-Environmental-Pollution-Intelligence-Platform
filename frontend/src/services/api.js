import axios from 'axios';

// The proxy in vite.config.js will map relative /api calls to the backend on port 8000
const API_BASE = '';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Ingest single pollution record
  ingestPollution: async (record) => {
    const response = await apiClient.post('/api/pollution/ingest', record);
    return response.data;
  },

  // Get historical pollution records
  getRecords: async (pollutionType = null) => {
    const params = pollutionType ? { pollution_type: pollutionType } : {};
    const response = await apiClient.get('/api/pollution/records', { params });
    return response.data;
  },

  // Compute pollution indices (HPI, MI, PLI, CF, Igeo)
  computeIndices: async (record) => {
    const response = await apiClient.post('/api/pollution/compute-indices', record);
    return response.data;
  },

  // Upload and parse CSV data
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/pollution/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Forecast future pollution values using AI
  getForecast: async (forecastRequest) => {
    const response = await apiClient.post('/api/prediction/forecast', forecastRequest);
    return response.data;
  },

  // Get risk zones
  getRiskZones: async () => {
    const response = await apiClient.get('/api/prediction/risk-zones');
    return response.data;
  },

  // Get GIS hotspot coordinates
  getHotspots: async () => {
    const response = await apiClient.get('/api/gis/hotspots');
    return response.data;
  },

  // Get GIS pollution source coordinates and metadata
  getSources: async () => {
    const response = await apiClient.get('/api/gis/sources');
    return response.data;
  },

  // Get current active or historical alerts
  getAlerts: async (acknowledged = null) => {
    const params = acknowledged !== null ? { acknowledged } : {};
    const response = await apiClient.get('/api/alerts/', { params });
    return response.data;
  },

  // Acknowledge an alert by ID
  acknowledgeAlert: async (alertId) => {
    const response = await apiClient.put(`/api/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  // Get report download link URL
  getReportDownloadUrl: (location) => {
    return `/api/reports/generate?location=${encodeURIComponent(location)}`;
  },
};
