import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ScanLine, FileSearch, Building2, Link as LinkIcon, Network, AlertOctagon, History, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Analyzer', path: '/job-analyzer', icon: ScanLine },
    { name: 'Company Checker', path: '/company-checker', icon: Building2 },
    { name: 'Offer Forensics', path: '/offer-letter', icon: FileSearch },
    { name: 'URL Scanner', path: '/url-scanner', icon: LinkIcon },
    { name: 'Trust Graph™', path: '/trust-graph', icon: Network },
    { name: 'Community Alerts', path: '/community-alerts', icon: AlertOctagon },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                  JOBTRUST
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                  AI SEC
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Recruitment Trust Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/job-analyzer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <ScanLine className="w-4 h-4" />
              <span>Verify Opportunity</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Scrollable Bar */}
      <div className="xl:hidden border-t border-slate-900 bg-slate-950/90 px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
