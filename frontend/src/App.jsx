import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import JobAnalyzerPage from './pages/JobAnalyzerPage';
import CompanyCheckerPage from './pages/CompanyCheckerPage';
import OfferLetterPage from './pages/OfferLetterPage';
import UrlScannerPage from './pages/UrlScannerPage';
import TrustGraphPage from './pages/TrustGraphPage';
import CommunityReportsPage from './pages/CommunityReportsPage';
import VerificationHistoryPage from './pages/VerificationHistoryPage';
import ScanDetailPage from './pages/ScanDetailPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/job-analyzer" element={<JobAnalyzerPage />} />
            <Route path="/company-checker" element={<CompanyCheckerPage />} />
            <Route path="/offer-letter" element={<OfferLetterPage />} />
            <Route path="/url-scanner" element={<UrlScannerPage />} />
            <Route path="/trust-graph" element={<TrustGraphPage />} />
            <Route path="/community-alerts" element={<CommunityReportsPage />} />
            <Route path="/history" element={<VerificationHistoryPage />} />
            <Route path="/scans/:id" element={<ScanDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
