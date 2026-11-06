import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from 'lucide-react';

export default function RiskMeter({ score = 0, category = 'Lower observed risk', size = 'md' }) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let barColor = 'bg-emerald-500';
  let Icon = ShieldCheck;

  if (normalizedScore >= 80) {
    colorClass = 'text-red-400 border-red-500/30 bg-red-500/10';
    barColor = 'bg-red-500';
    Icon = ShieldX;
  } else if (normalizedScore >= 60) {
    colorClass = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
    barColor = 'bg-orange-500';
    Icon = ShieldAlert;
  } else if (normalizedScore >= 30) {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    barColor = 'bg-amber-500';
    Icon = AlertTriangle;
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className={`px-2 py-0.5 rounded text-xs font-bold border ${colorClass}`}>
          {normalizedScore}/100
        </div>
        <span className="text-xs text-slate-300">{category}</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border ${colorClass} flex flex-col justify-between relative overflow-hidden backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Fraud Risk Assessment
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">Score Range: 0-100</span>
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-4xl font-extrabold tracking-tight font-mono">{normalizedScore}</span>
        <span className="text-sm font-medium text-slate-400">/ 100</span>
        <span className="ml-auto text-sm font-semibold">{category}</span>
      </div>

      {/* Progress Bar with markers */}
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 mt-2 overflow-hidden flex">
        <div
          className={`h-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
        <span>0 (Safe)</span>
        <span>30 (Moderate)</span>
        <span>60 (High)</span>
        <span>80+ (Critical)</span>
      </div>
    </div>
  );
}
