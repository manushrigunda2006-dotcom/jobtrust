import React from 'react';
import { Building2, Globe, Mail, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function RecruiterTrustGraph({ graphData }) {
  if (!graphData) return null;

  const {
    claimed_company,
    trusted_official_domain,
    recruiter_email,
    website_domain,
    nodes = [],
    edges = [],
    impersonation_detected,
    verdict_summary,
    risk_assessment
  } = graphData;

  const getNodeIcon = (type) => {
    switch (type) {
      case 'company':
        return <Building2 className="w-5 h-5 text-cyan-400" />;
      case 'official_registry':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-indigo-400" />;
      case 'website':
        return <Globe className="w-5 h-5 text-amber-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'verified':
        return 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300';
      case 'mismatch':
      case 'suspicious':
        return 'border-red-500/80 bg-red-950/40 text-red-300 shadow-lg shadow-red-950/50';
      case 'warning':
        return 'border-amber-500/60 bg-amber-950/30 text-amber-300';
      default:
        return 'border-slate-700 bg-slate-900/60 text-slate-200';
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              RECRUITER TRUST GRAPH™
            </h3>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
              Identity Graph Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-entity cross-verification comparing claimed branding against verified infrastructure.
          </p>
        </div>

        <div>
          {impersonation_detected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/90 text-red-300 border border-red-700 shadow-sm animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              IMPERSONATION DETECTED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              IDENTITY CONSISTENT
            </span>
          )}
        </div>
      </div>

      {/* Visual Graph Canvas Representation */}
      <div className="relative bg-slate-950/80 rounded-xl p-6 border border-slate-800/80 cyber-grid overflow-hidden">
        {/* Central Hub and Spoke Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Claimed & Verified Registry */}
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${getStatusBorder('neutral')} transition-all`}>
              <div className="flex items-center gap-2 mb-1">
                {getNodeIcon('company')}
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Target Identity
                </span>
              </div>
              <div className="text-sm font-bold text-white truncate">{claimed_company}</div>
              <div className="text-[10px] text-slate-400 mt-1">Claimed by Recruiter / Offer</div>
            </div>

            <div className={`p-4 rounded-xl border ${getStatusBorder(trusted_official_domain ? 'verified' : 'warning')} transition-all`}>
              <div className="flex items-center gap-2 mb-1">
                {getNodeIcon('official_registry')}
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Verified Corporate Registry
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-emerald-400 truncate">
                {trusted_official_domain ? trusted_official_domain : 'Unlisted in Directory'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {trusted_official_domain ? 'Authentic Registrar Record' : 'Manual verification needed'}
              </div>
            </div>
          </div>

          {/* Column 2: Trust Relationship Vector */}
          <div className="hidden md:flex flex-col items-center justify-center gap-4 text-center px-2">
            <div className="w-full flex items-center justify-center gap-2 text-xs font-mono text-slate-400 py-2 px-3 rounded-lg bg-slate-900 border border-slate-800">
              <span>Cross-Audit</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div className={`p-3 rounded-xl border text-xs leading-relaxed max-w-xs ${
              impersonation_detected
                ? 'border-red-800 bg-red-950/40 text-red-200'
                : 'border-emerald-800 bg-emerald-950/40 text-emerald-200'
            }`}>
              <div className="font-bold mb-1 flex items-center justify-center gap-1">
                {impersonation_detected ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {impersonation_detected ? 'Spoofing Evidence' : 'Trust Corroborated'}
              </div>
              {impersonation_detected
                ? 'Recruiter communication channel is disconnected from official enterprise domain.'
                : 'Recruiter communication originates from verified corporate infrastructure.'}
            </div>
          </div>

          {/* Column 3: Communication & Portal Nodes */}
          <div className="space-y-4">
            {recruiter_email && (
              <div className={`p-4 rounded-xl border ${
                recruiter_email.includes('@gmail.com') || (trusted_official_domain && !recruiter_email.endsWith(trusted_official_domain))
                  ? getStatusBorder('mismatch')
                  : getStatusBorder('verified')
              } transition-all`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getNodeIcon('email')}
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Recruiter Email Domain
                    </span>
                  </div>
                  {recruiter_email.includes('@gmail.com') && (
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded font-mono">
                      FREE MAIL
                    </span>
                  )}
                </div>
                <div className="text-sm font-mono font-bold text-white truncate">{recruiter_email}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {recruiter_email.includes('@gmail.com') ? 'Suspicious: Public consumer mail' : 'Enterprise email host'}
                </div>
              </div>
            )}

            {website_domain && (
              <div className={`p-4 rounded-xl border ${
                trusted_official_domain && website_domain !== trusted_official_domain
                  ? getStatusBorder('suspicious')
                  : getStatusBorder('verified')
              } transition-all`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getNodeIcon('website')}
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Recruitment Portal Domain
                    </span>
                  </div>
                  {trusted_official_domain && website_domain !== trusted_official_domain && (
                    <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-mono">
                      MISMATCH
                    </span>
                  )}
                </div>
                <div className="text-sm font-mono font-bold text-white truncate">{website_domain}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {trusted_official_domain && website_domain !== trusted_official_domain
                    ? 'Caution: Does not match official registry'
                    : 'Validated corporate portal'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edge / Connection Details Table */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono">
            Identity Graph Vectors & Edge Status
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {edges.map((e, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${
                    e.status === 'valid' ? 'bg-emerald-400' :
                    e.status === 'invalid' ? 'bg-red-400 animate-ping' : 'bg-amber-400'
                  }`} />
                  <span className="text-slate-300 font-mono text-[11px] truncate">{e.label}</span>
                </div>
                <RiskBadge severity={e.status === 'valid' ? 'INFO' : e.status === 'invalid' ? 'CRITICAL' : 'MEDIUM'} text={e.status.toUpperCase()} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verdict Callout */}
      <div className={`mt-4 p-4 rounded-xl border ${
        impersonation_detected
          ? 'bg-red-950/30 border-red-800/60 text-red-200'
          : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
      }`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
          {impersonation_detected ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          EXPLAINABLE IDENTITY VERDICT
        </div>
        <p className="text-xs leading-relaxed">{verdict_summary}</p>
      </div>
    </div>
  );
}
