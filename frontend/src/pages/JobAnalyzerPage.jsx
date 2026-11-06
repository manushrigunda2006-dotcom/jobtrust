import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine, AlertTriangle, ShieldCheck, Download, Sparkles, Building2,
  DollarSign, Mail, Network, ArrowRight, CheckCircle2, AlertOctagon
} from 'lucide-react';
import { analyzeJob, getPdfReportDownloadUrl } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import EvidenceCard from '../components/EvidenceCard';
import DemoSelector from '../components/DemoSelector';

export default function JobAnalyzerPage() {
  const [jobText, setJobText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  const handleSelectDemo = (scenario) => {
    setActiveScenarioId(scenario.id);
    setCompanyName(scenario.company || '');
    setJobTitle(scenario.role || '');
    setSourceUrl(scenario.website || '');
    setJobText(scenario.job_text || '');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!jobText.trim() || jobText.trim().length < 20) {
      setError('Please provide at least 20 characters of job description text.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeJob({
        job_text: jobText,
        company_name: companyName.trim() || undefined,
        job_title: jobTitle.trim() || undefined,
        source_url: sourceUrl.trim() || undefined,
      });
      setResult(data);
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze job description. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Job Description Analyzer</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                MODULE 1: NLP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Extracts upfront fee demands, guaranteed selection claims, urgency pressure, and trains ML text models.
            </p>
          </div>
        </div>

        {/* Demo Benchmarks Selector */}
        <DemoSelector onSelectScenario={handleSelectDemo} activeScenarioId={activeScenarioId} />

        {/* Form and Input Area */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Microsoft, TCS, Apex Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Job / Internship Title (Optional)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Python Developer Intern"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Listing / Website URL (Optional)
                </label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="e.g. https://careers.company.com/job/102"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Job Description or Vacancy Post Text <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {jobText.length} characters (min 20)
                </span>
              </div>
              <textarea
                rows={7}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the complete job description, internship vacancy message, email text, or WhatsApp recruitment copy here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-slate-200 placeholder-slate-600 font-mono leading-relaxed resize-y"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Data is scanned in-memory and evaluated against transparent threat heuristics.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-4 h-4" />
                    <span>Run Fraud Assessment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Scan Results View */}
        {result && (
          <div className="space-y-6 pt-4">
            {/* Top Risk Meter */}
            <RiskMeter
              score={result.risk_assessment.score}
              category={result.risk_assessment.category}
            />

            {/* Extracted Entities Grid */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Extracted Recruitment Attributes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Company</span>
                  <span className="font-semibold text-white">
                    {result.extracted_entities.company_name || companyName || 'Not detected'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Role / Designation</span>
                  <span className="font-semibold text-white">
                    {result.extracted_entities.job_title || jobTitle || 'General Vacancy'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Stated Salary</span>
                  <span className="font-semibold text-white">
                    {result.extracted_entities.salary_mentioned || 'Not explicitly stated'}
                  </span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  result.extracted_entities.registration_or_fee
                    ? 'bg-red-950/30 border-red-800 text-red-300'
                    : 'bg-slate-950/80 border-slate-800 text-white'
                }`}>
                  <span className="text-[10px] font-mono uppercase block mb-1">Upfront Fee Identified</span>
                  <span className="font-semibold">
                    {result.extracted_entities.registration_or_fee ? result.extracted_entities.registration_or_fee : 'None detected (Safe)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Findings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Threat & Verification Evidence ({result.risk_assessment.findings.length})
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  TF-IDF ML Model Anomaly Score: {result.nlp_model_score}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.risk_assessment.findings.map((f, idx) => (
                  <EvidenceCard key={idx} finding={f} />
                ))}
              </div>
            </div>

            {/* Recommended Protective Actions */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Actionable Protective Guidance
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.risk_assessment.recommended_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold shrink-0">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Export and Cross-Tool Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400">
                JOBTRUST Audit ID: <span className="font-mono text-cyan-400">{result.scan_id.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/trust-graph"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect in Trust Graph™</span>
                </Link>
                <a
                  href={getPdfReportDownloadUrl(result.scan_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Audit</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
