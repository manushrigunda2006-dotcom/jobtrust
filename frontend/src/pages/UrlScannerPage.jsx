import React, { useState } from 'react';
import {
  Link as LinkIcon, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink,
  Download, Globe, CheckCircle2, Lock, ArrowRight
} from 'lucide-react';
import { analyzeUrl, getPdfReportDownloadUrl } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import EvidenceCard from '../components/EvidenceCard';
import DemoSelector from '../components/DemoSelector';
import RiskBadge from '../components/RiskBadge';

export default function UrlScannerPage() {
  const [url, setUrl] = useState('');
  const [claimedCompany, setClaimedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const handleSelectDemo = (sc) => {
    setActiveScenarioId(sc.id);
    setUrl(sc.url || sc.website || '');
    setClaimedCompany(sc.company || '');
    setResult(null);
    setError(null);
  };

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!url.trim()) {
      setError('Please provide a URL to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeUrl({
        url: url.trim(),
        claimed_company: claimedCompany.trim() || undefined,
      });
      setResult(data);
    } catch (err) {
      console.error('URL scan error:', err);
      setError(err.response?.data?.detail || 'Failed to inspect URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">URL & Phishing Detector</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                MODULE 5: WEB THREAT INTEL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Safely inspects recruitment links for shortening, raw IP hosts, lookalike subdomains, and credential-harvesting keywords.
            </p>
          </div>
        </div>

        {/* Demo Benchmarks */}
        <DemoSelector onSelectScenario={handleSelectDemo} activeScenarioId={activeScenarioId} />

        {/* Form */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <form onSubmit={handleScan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Recruitment / Application URL <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. https://micros0ft-careers-portal.site/verify?login=true or bit.ly/3x..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Claimed Company (Optional)
                </label>
                <input
                  type="text"
                  value={claimedCompany}
                  onChange={(e) => setClaimedCompany(e.target.value)}
                  placeholder="e.g. Microsoft, Google"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                />
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
                Static & safe URL parsing: no uncontrolled server-side redirects are executed.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing URL Topology...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Scan Link Safely</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 pt-4">
            <RiskMeter
              score={result.risk_assessment.score}
              category={result.risk_assessment.category}
            />

            {/* Architecture Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                URL Architecture & Threat Intelligence Feed
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Registered Domain</span>
                  <span className="font-semibold font-mono text-cyan-300">{result.domain}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">URL Shortener Mask</span>
                  <span className={`font-semibold ${result.is_shortener ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.is_shortener ? 'YES (Masked Destination)' : 'NO (Direct Domain)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Raw IP Destination</span>
                  <span className={`font-semibold ${result.is_ip_address ? 'text-red-400' : 'text-emerald-400'}`}>
                    {result.is_ip_address ? 'YES (Suspicious Host)' : 'NO (Registered DNS)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Threat Intel Source</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {result.threat_intel_source}
                  </span>
                </div>
              </div>

              {result.suspicious_keywords_found.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-amber-200">
                    Phishing / credential keywords identified in URL path:{' '}
                    <span className="font-mono font-bold text-amber-400">
                      {result.suspicious_keywords_found.join(', ')}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Findings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Threat Evidence Findings ({result.risk_assessment.findings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.risk_assessment.findings.map((f, idx) => (
                  <EvidenceCard key={idx} finding={f} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400">
                JOBTRUST Audit ID: <span className="font-mono text-cyan-400">{result.scan_id.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={getPdfReportDownloadUrl(result.scan_id)}
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
