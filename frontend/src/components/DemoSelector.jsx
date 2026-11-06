import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { getDemoScenarios } from '../services/api';

export default function DemoSelector({ onSelectScenario, activeScenarioId }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const data = await getDemoScenarios();
        setScenarios(data);
      } catch (err) {
        console.error('Failed to load demo scenarios:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchScenarios();
  }, []);

  if (loading || scenarios.length === 0) return null;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 mb-8 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Vedathon Demo Benchmarks
            </h3>
            <p className="text-xs text-slate-400">
              Select a pre-built synthetic case study to inspect real-time AI & threat intelligence analysis.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          Synthetic Test Data
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = activeScenarioId === sc.id;
          let borderTheme = 'border-slate-800 hover:border-slate-700 bg-slate-950/50';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;

          if (sc.id === 'scenario-2') {
            icon = <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />;
          } else if (sc.id === 'scenario-3') {
            icon = <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />;
          }

          if (isSelected) {
            borderTheme = 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500';
          }

          return (
            <div
              key={sc.id}
              className={`p-4 rounded-xl border ${borderTheme} transition-all duration-200 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="text-xs font-bold text-slate-200 truncate">{sc.company}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    sc.id === 'scenario-1' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    sc.id === 'scenario-2' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {sc.id === 'scenario-1' ? 'Legitimate' : sc.id === 'scenario-2' ? 'Advance-Fee Scam' : 'Impersonation'}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-300 mb-2">{sc.role}</div>

                <ul className="text-[11px] text-slate-400 space-y-1 mb-4">
                  {sc.key_signals.slice(0, 2).map((sig, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span className="truncate">{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectScenario(sc)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <span>{isSelected ? 'Scenario Active' : 'Load Scenario'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
