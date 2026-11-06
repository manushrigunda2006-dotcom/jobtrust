import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History, Search, Filter, Download, ExternalLink, Calendar,
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { getScanHistory, getPdfReportDownloadUrl } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function VerificationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getScanHistory({ scan_type: typeFilter || undefined, limit: 50 });
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [typeFilter]);

  const filteredHistory = history.filter((item) => {
    const q = search.toLowerCase();
    const company = (item.company_name || '').toLowerCase();
    const title = (item.opportunity_title || '').toLowerCase();
    const id = item.id.toLowerCase();
    return company.includes(q) || title.includes(q) || id.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <History className="w-6 h-6 text-cyan-400" />
                <span>Verification Audit History</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Immutable log of previously analyzed opportunities, risk scores, and generated forensic PDF reports.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, title, or audit ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white"
            >
              <option value="">All Verification Types</option>
              <option value="job">Job Descriptions (NLP)</option>
              <option value="company">Company Authenticity</option>
              <option value="email">Email Intelligence</option>
              <option value="url">URL & Phishing</option>
              <option value="offer_letter">Offer Letter Forensics</option>
              <option value="trust_graph">Recruiter Trust Graph™</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Audit ID</th>
                  <th className="py-3 px-4">Entity & Opportunity</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Risk Assessment</th>
                  <th className="py-3 px-4">Findings</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 font-mono">
                      Loading audit records...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 font-mono">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-cyan-400">
                        {s.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{s.company_name || 'Unspecified'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{s.opportunity_title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {s.scan_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${
                            s.risk_score >= 80 ? 'text-red-400' :
                            s.risk_score >= 60 ? 'text-orange-400' :
                            s.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {Math.round(s.risk_score)}/100
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{s.risk_category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {s.findings_count} signals
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/scans/${s.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                            title="View Full Report"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={getPdfReportDownloadUrl(s.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
