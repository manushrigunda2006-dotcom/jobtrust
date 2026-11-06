import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ScanLine, FileSearch,
  Building2, Link as LinkIcon, Download, ExternalLink, Activity, Users,
  ArrowUpRight, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { getDashboardStats, getPdfReportDownloadUrl } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading Threat Intelligence Telemetry...</span>
        </div>
      </div>
    );
  }

  const {
    total_analyzed = 0,
    requiring_review = 0,
    high_risk_count = 0,
    low_risk_count = 0,
    risk_distribution = [],
    fraud_categories = [],
    recent_scans = [],
    recent_reports = []
  } = stats || {};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Recruitment Security Telemetry</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time intelligence dashboard monitoring student scam patterns, lookalike domains, and fee requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/job-analyzer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <ScanLine className="w-4 h-4" />
              <span>New Job Scan</span>
            </Link>
            <Link
              to="/community-alerts"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all"
            >
              <span>Community Alerts</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Total Submissions
              </span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">{total_analyzed}</div>
            <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <span>Audited through multi-module engine</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Requiring Review
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400">{requiring_review}</div>
            <div className="text-[11px] text-slate-400 mt-1">Moderate risk score (30–79)</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-red-900/40 bg-red-950/10 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400 font-mono">
                High-Risk Flagged
              </span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-red-400">{high_risk_count}</div>
            <div className="text-[11px] text-red-300/80 mt-1">Contains fees or impersonation</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-emerald-900/40 bg-emerald-950/10 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Verified Authentic
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">{low_risk_count}</div>
            <div className="text-[11px] text-emerald-300/80 mt-1">Lower observed risk (0–29)</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Risk Distribution */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Risk Tier Distribution
                </h3>
                <p className="text-xs text-slate-400">Proportion of opportunities classified across risk bands.</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                0-100 Score
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#E2E8F0' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#0284C7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Fraud Category Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Primary Scam Vectors
                </h3>
                <p className="text-xs text-slate-400">Prevalence of specific deception techniques observed.</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Threat Breakdown
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {fraud_categories.map((fc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{fc.category}</span>
                    <span className="font-mono text-cyan-400 font-bold">{fc.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${
                        i === 0 ? 'bg-red-500' :
                        i === 1 ? 'bg-orange-500' :
                        i === 2 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${fc.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Recent Verification Audits
              </h3>
              <p className="text-xs text-slate-400">Latest analyzed recruitment opportunities.</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
              <span>Full Audit History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Entity & Role</th>
                  <th className="py-3 px-4">Scan Type</th>
                  <th className="py-3 px-4">Risk Assessment</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recent_scans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 font-mono">
                      No scans executed yet. Run a scan from the Job Analyzer!
                    </td>
                  </tr>
                ) : (
                  recent_scans.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{s.company}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{s.title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {s.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${
                            s.score >= 80 ? 'text-red-400' :
                            s.score >= 60 ? 'text-orange-400' :
                            s.score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {s.score}/100
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{s.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {s.date}
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

        {/* Recent Community Reports Feed */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Recent Student Scam Alerts
              </h3>
              <p className="text-xs text-slate-400">Crowdsourced reports with automated PII masking.</p>
            </div>
            <Link to="/community-alerts" className="text-xs font-semibold text-cyan-400 hover:underline">
              Submit an Alert →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recent_reports.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{r.company}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      FLAGGED
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mb-1">{r.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-3">
                    {r.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                  <span>Report #{r.id}</span>
                  <span>{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
