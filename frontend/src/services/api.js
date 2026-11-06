import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeJob = async (data) => {
  const resp = await api.post('/analyze/job', data);
  return resp.data;
};

export const analyzeCompany = async (data) => {
  const resp = await api.post('/analyze/company', data);
  return resp.data;
};

export const analyzeEmail = async (data) => {
  const resp = await api.post('/analyze/email', data);
  return resp.data;
};

export const analyzeUrl = async (data) => {
  const resp = await api.post('/analyze/url', data);
  return resp.data;
};

export const analyzeOfferLetter = async (formData) => {
  const resp = await api.post('/analyze/offer-letter', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resp.data;
};

export const analyzeTrustGraph = async (formData) => {
  const resp = await api.post('/analyze/trust-graph', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return resp.data;
};

export const getScanDetails = async (scanId) => {
  const resp = await api.get(`/scans/${scanId}`);
  return resp.data;
};

export const getScanHistory = async (params = {}) => {
  const resp = await api.get('/scans/history', { params });
  return resp.data;
};

export const getDashboardStats = async () => {
  const resp = await api.get('/dashboard/stats');
  return resp.data;
};

export const submitCommunityReport = async (data) => {
  const resp = await api.post('/reports/submit', data);
  return resp.data;
};

export const getCommunityReports = async () => {
  const resp = await api.get('/reports/community');
  return resp.data;
};

export const getDemoScenarios = async () => {
  const resp = await api.get('/demo/scenarios');
  return resp.data;
};

export const getPdfReportDownloadUrl = (scanId) => {
  return `/api/reports/${scanId}/pdf`;
};

export default api;
