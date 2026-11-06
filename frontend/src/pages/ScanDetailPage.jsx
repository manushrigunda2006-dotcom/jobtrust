import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck, Download, ArrowLeft, Calendar, Building2,
  FileText, ExternalLink, Activity
} from 'lucide-react';
import { getScanDetails, getPdfReportDownloadUrl } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import EvidenceCard from '../components/EvidenceCard';

export default function ScanDetailPage() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await getScanDetails(id);
        setScan(data);
      } catch (err) {
        console.error('Failed to load scan detail:', err);
        setError('Audit report not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading Security Audit Report #{id.slice(0, 8)}...</span>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Audit Report Error</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to retrieve scan record.'}</p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification History</span>
        </Link>
      </div>
    );
  }

  const { risk_assessment } = scan;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-mono mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Audit Trail</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {scan.opportunity_title || 'Security Audit Report'}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {scan.scan_type.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
              <span>Audit ID: <strong className="text-cyan-400">{scan.id}</strong></span>
              <span>•</span>
              <span>Scanned on: {new Date(scan.created_at).toLocaleString()}</span>
            </div>
          </div>

          <a
            href={getPdfReportDownloadUrl(scan.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </a>
        </div>

        {/* Risk Meter */}
        <RiskMeter
          score={risk_assessment.score}
          category={risk_assessment.category}
        />

        {/* Overview Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
            Target Opportunity Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Company / Entity</span>
              <span className="font-semibold text-white">{scan.company_name || 'Unspecified'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Audit Verification Type</span>
              <span className="font-semibold text-white">{scan.scan_type.toUpperCase()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Total Evidence Signals</span>
              <span className="font-semibold text-white">{risk_assessment.findings.length} findings</span>
            </div>
          </div>

          {scan.submitted_content && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Submitted Content Preview</span>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-[11px] font-mono text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {scan.submitted_content}
              </div>
            </div>
          )}
        </div>

        {/* Evidence Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Threat & Risk Evidence Findings ({risk_assessment.findings.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risk_assessment.findings.map((f, idx) => (
              <EvidenceCard key={idx} finding={f} />
            ))}
          </div>
        </div>

        {/* Protective Recommendations */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Recommended Protective Next Steps
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {risk_assessment.recommended_actions.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
