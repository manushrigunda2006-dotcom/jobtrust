import React, { useState, useEffect } from 'react';
import {
  Network, Building2, Globe, Mail, ShieldAlert, ShieldCheck, Download,
  Sparkles, AlertTriangle, ArrowRight
} from 'lucide-react';
import { analyzeTrustGraph, getPdfReportDownloadUrl } from '../services/api';
import RecruiterTrustGraph from '../components/RecruiterTrustGraph';
import RiskMeter from '../components/RiskMeter';
import EvidenceCard from '../components/EvidenceCard';
import DemoSelector from '../components/DemoSelector';

export default function TrustGraphPage() {
  const [claimedCompany, setClaimedCompany] = useState('Microsoft');
  const [recruiterEmail, setRecruiterEmail] = useState('careers.microsoft.talent@gmail.com');
  const [website, setWebsite] = useState('https://micros0ft-careers-portal.site');
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState('scenario-3');

  const handleSelectDemo = (sc) => {
    setActiveScenarioId(sc.id);
    setClaimedCompany(sc.company || '');
    setRecruiterEmail(sc.email || '');
    setWebsite(sc.website || '');
    setGraphData(null);
    setError(null);
  };

  const handleGenerateGraph = async (e) => {
    e?.preventDefault();
    if (!claimedCompany.trim()) {
      setError('Please provide a claimed company name.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('claimed_company', claimedCompany.trim());
      if (recruiterEmail.trim()) formData.append('recruiter_email', recruiterEmail.trim());
      if (website.trim()) formData.append('website', website.trim());

      const data = await analyzeTrustGraph(formData);
      setGraphData(data);
    } catch (err) {
      console.error('Trust graph error:', err);
      setError(err.response?.data?.detail || 'Failed to generate trust graph.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first mount with initial demo values
  useEffect(() => {
    handleGenerateGraph();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Network className="w-6 h-6 text-cyan-400" />
                <span>RECRUITER TRUST GRAPH™</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                SPECIAL INNOVATION FEATURE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cross-entity verification mapping claimed enterprise employers against communication infrastructure, registrar records, and typosquatted domains.
            </p>
          </div>
        </div>

        {/* Demo Benchmarks */}
        <DemoSelector onSelectScenario={handleSelectDemo} activeScenarioId={activeScenarioId} />

        {/* Input Form */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <form onSubmit={handleGenerateGraph} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Claimed Employer Entity <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={claimedCompany}
                    onChange={(e) => setClaimedCompany(e.target.value)}
                    placeholder="e.g. Microsoft, Google, TCS"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Recruiter Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    placeholder="e.g. careers.microsoft.talent@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Submitted Website / Portal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://micros0ft-careers-portal.site"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Identifies lookalike brand domains (e.g. 0 instead of o, hyphenated suffixes).
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Resolving Trust Topology...</span>
                  </>
                ) : (
                  <>
                    <Network className="w-4 h-4" />
                    <span>Generate Trust Graph</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Visual Trust Graph View */}
        {graphData && (
          <div className="space-y-6">
            <RiskMeter
              score={graphData.risk_assessment.score}
              category={graphData.risk_assessment.category}
            />

            {/* Recruiter Trust Graph Component */}
            <RecruiterTrustGraph graphData={graphData} />

            {/* Evidence Findings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Impersonation Threat Evidence ({graphData.risk_assessment.findings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {graphData.risk_assessment.findings.map((f, idx) => (
                  <EvidenceCard key={idx} finding={f} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400">
                JOBTRUST Audit ID: <span className="font-mono text-cyan-400">{graphData.scan_id.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={getPdfReportDownloadUrl(graphData.scan_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audit PDF</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
