import React, { useState } from 'react';
import {
  Building2, Globe, Mail, ShieldCheck, ShieldAlert, AlertTriangle,
  Lock, CheckCircle2, Download, Network, ArrowRight
} from 'lucide-react';
import { analyzeCompany, getPdfReportDownloadUrl } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import EvidenceCard from '../components/EvidenceCard';
import DemoSelector from '../components/DemoSelector';
import RiskBadge from '../components/RiskBadge';

export default function CompanyCheckerPage() {
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const handleSelectDemo = (sc) => {
    setActiveScenarioId(sc.id);
    setCompanyName(sc.company || '');
    setWebsite(sc.website || '');
    setRecruiterEmail(sc.email || '');
    setResult(null);
    setError(null);
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!companyName.trim()) {
      setError('Please provide a company name.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCompany({
        company_name: companyName.trim(),
        company_website: website.trim() || undefined,
        recruiter_email: recruiterEmail.trim() || undefined,
      });
      setResult(data);
    } catch (err) {
      console.error('Company verification error:', err);
      setError(err.response?.data?.detail || 'Failed to verify company. Please check server status.');
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
              <h1 className="text-2xl font-bold text-white tracking-tight">Company Authenticity Checker</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                MODULE 2 & 3: IDENTITY & DNS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cross-references corporate registrar databases, detects typosquatted lookalike domains, and validates DNS MX records.
            </p>
          </div>
        </div>

        {/* Demo Benchmarks */}
        <DemoSelector onSelectScenario={handleSelectDemo} activeScenarioId={activeScenarioId} />

        {/* Input Form */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Microsoft, TCS, Infosys"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Company Website / Portal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://micros0ft-careers.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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
                    placeholder="e.g. hr.microsoft@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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
              <span className="text-[11px] text-slate-500">
                Never treat HTTPS encryption alone as proof of legitimate corporate authenticity.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Authenticity</span>
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

            {/* Corporate Registry & Domain Security Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Registry Card */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    Corporate Registry Status
                  </h3>
                  <RiskBadge
                    severity={result.is_in_trusted_registry ? 'INFO' : 'MEDIUM'}
                    text={result.is_in_trusted_registry ? 'REGISTERED' : 'UNVERIFIED'}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Claimed Organization:</span>
                    <span className="font-semibold text-white">{result.company_name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Official Registered Domain:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {result.trusted_domain || 'None in directory'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Recruiter Domain Match:</span>
                    <span className={`font-mono font-bold ${
                      result.email_domain_match === true ? 'text-emerald-400' :
                      result.email_domain_match === false ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {result.email_domain_match === true ? 'MATCHED' :
                       result.email_domain_match === false ? 'MISMATCH (SPOOFED)' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Domain & DNS Card */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Domain & DNS Security
                  </h3>
                  {result.domain_security?.is_lookalike && (
                    <RiskBadge severity="CRITICAL" text="LOOKALIKE DETECTED" />
                  )}
                </div>

                {result.domain_security ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Analyzed Domain:</span>
                      <span className="font-mono text-white">{result.domain_security.domain}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">HTTPS Encryption:</span>
                      <span className={result.domain_security.has_https ? 'text-emerald-400' : 'text-amber-400'}>
                        {result.domain_security.has_https ? 'Active (TLS)' : 'Insecure (HTTP)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">DNS MX Mail Exchanger:</span>
                      <span className={result.domain_security.has_dns_mx ? 'text-emerald-400' : 'text-red-400'}>
                        {result.domain_security.has_dns_mx ? 'Configured' : 'Missing / Unreachable'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Typosquatting Risk:</span>
                      <span className={`font-bold ${result.domain_security.is_lookalike ? 'text-red-400' : 'text-emerald-400'}`}>
                        {result.domain_security.is_lookalike
                          ? `Spoofs ${result.domain_security.target_legitimate_domain}`
                          : 'No typosquatting detected'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center font-mono">
                    No website URL was submitted for domain analysis.
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Findings */}
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
