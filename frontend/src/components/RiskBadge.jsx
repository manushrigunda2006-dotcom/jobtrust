import React from 'react';

export default function RiskBadge({ severity = 'INFO', text }) {
  const s = severity.toUpperCase();
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  if (s === 'CRITICAL') {
    badgeStyle = 'bg-red-950/80 text-red-300 border-red-700/60 font-bold';
  } else if (s === 'HIGH') {
    badgeStyle = 'bg-orange-950/80 text-orange-300 border-orange-700/60 font-semibold';
  } else if (s === 'MEDIUM') {
    badgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
  } else if (s === 'LOW') {
    badgeStyle = 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
  } else if (s === 'INFO' || s === 'VERIFIED') {
    badgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${badgeStyle}`}>
      {text || s}
    </span>
  );
}
