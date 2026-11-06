import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function EvidenceCard({ finding }) {
  const { finding_type, severity, explanation, evidence_source, confidence } = finding;

  let Icon = Info;
  let borderHighlight = 'border-slate-800';

  if (severity === 'CRITICAL') {
    Icon = ShieldAlert;
    borderHighlight = 'border-red-900/60 bg-red-950/20';
  } else if (severity === 'HIGH') {
    Icon = AlertCircle;
    borderHighlight = 'border-orange-900/60 bg-orange-950/20';
  } else if (severity === 'MEDIUM') {
    Icon = AlertTriangle;
    borderHighlight = 'border-amber-900/60 bg-amber-950/20';
  } else if (severity === 'INFO' || severity === 'LOW') {
    Icon = CheckCircle;
    borderHighlight = 'border-emerald-900/50 bg-emerald-950/20';
  }

  const cleanTitle = finding_type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  return (
    <div className={`p-4 rounded-xl border ${borderHighlight} transition-all duration-200 hover:border-slate-700`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 shrink-0 ${
            severity === 'CRITICAL' ? 'text-red-400' :
            severity === 'HIGH' ? 'text-orange-400' :
            severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
          }`} />
          <h4 className="text-sm font-semibold text-slate-200">{cleanTitle}</h4>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge severity={severity} />
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        {explanation}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          Source: <span className="text-cyan-400 font-mono">{evidence_source}</span>
        </span>
        {confidence !== undefined && (
          <span className="flex items-center gap-1 font-mono">
            Confidence: <span className="text-slate-200 font-semibold">{Math.round(confidence * 100)}%</span>
          </span>
        )}
      </div>
    </div>
  );
}
