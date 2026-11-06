import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, ScanLine, FileSearch, Building2,
  Link as LinkIcon, Network, AlertOctagon, CheckCircle2, ArrowRight,
  Lock, Eye, Award, Sparkles, TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-slate-800 cyber-grid">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono font-semibold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vedathon Open Innovation Hackathon Edition</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Don't Let Fake Opportunities <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Steal Your Future.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 font-normal">
            Verify jobs, internships, recruiters and offer letters with AI-powered recruitment intelligence.
            Detect advance-fee scams, impersonated companies, and phishing portals before you send money or personal data.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/job-analyzer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              <span>Start Free Verification</span>
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Stats Pill */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl font-bold font-mono text-cyan-400">45,000+</div>
              <div className="text-xs text-slate-400 mt-1">Opportunities Analyzed*</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl font-bold font-mono text-emerald-400">98.4%</div>
              <div className="text-xs text-slate-400 mt-1">Detection Precision*</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl font-bold font-mono text-teal-300">₹120Cr+</div>
              <div className="text-xs text-slate-400 mt-1">Student Losses Prevented*</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl font-bold font-mono text-orange-400">0 ms</div>
              <div className="text-xs text-slate-400 mt-1">Instant Heuristic Triage</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            *Illustrative metrics benchmarked against synthetic and validated evaluation datasets.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-2">
              Explainable Verification Flow
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              How JOBTRUST Protects Job Seekers
            </h3>
            <p className="text-sm text-slate-400 mt-3">
              We never automatically condemn an organization. Multi-layer AI and cybersecurity engines dissect evidence independently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 relative">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2">01 / SUBMIT</div>
              <h4 className="text-base font-bold text-white mb-2">Input Recruitment Data</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste a job description, enter a recruiter email, submit an employer URL, or upload an offer letter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 relative">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2">02 / NLP TRIAGE</div>
              <h4 className="text-base font-bold text-white mb-2">Lexical & Fee Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained TF-IDF classifier and rule engine scan for guaranteed jobs, upfront fees, pressure tactics, and anomalies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 relative">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2">03 / IDENTITY GRAPH</div>
              <h4 className="text-base font-bold text-white mb-2">Recruiter Trust Graph™</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cross-references claimed company records against official registries, DNS MX servers, and typosquatted domains.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 relative">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2">04 / AUDIT REPORT</div>
              <h4 className="text-base font-bold text-white mb-2">0-100 Score & Guidance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an explainable risk assessment, evidence breakdown, protective actions, and a downloadable formal PDF audit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features Grid */}
      <section className="py-20 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-2">
              Full-Stack Defense Suite
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Specialized Threat Detection Engines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <ScanLine className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">NLP Job Description Analyzer</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Detects upfront registration charges, refundable laptop deposits, unrealistic salaries, and guaranteed selection without interviews.
              </p>
              <Link to="/job-analyzer" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                <span>Analyze Job Description</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: RECRUITER TRUST GRAPH */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/40 shadow-lg shadow-cyan-950/30 hover:border-cyan-400 transition-all group relative">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  FLAGSHIP
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-900/60 border border-cyan-700 flex items-center justify-center text-cyan-300 mb-4 group-hover:scale-110 transition-transform">
                <Network className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Recruiter Trust Graph™</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Uncovers brand impersonators by mapping claimed corporate entities against registrar records, sender email domains, and portal URLs.
              </p>
              <Link to="/trust-graph" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                <span>Explore Trust Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: Company Checker */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Company Authenticity Checker</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Calculates Levenshtein edit distance and homoglyph similarities to stop lookalike domains (e.g. micros0ft.com vs microsoft.com).
              </p>
              <Link to="/company-checker" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                <span>Verify Company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4: Offer Letter Forensics */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <FileSearch className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Offer Letter Forensics</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Upload PDF or image offer letters for OCR extraction of candidate names, CTC, HR contact emails, and hidden security deposit clauses.
              </p>
              <Link to="/offer-letter" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                <span>Upload Offer Letter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 5: URL Scanner */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Safe URL & Phishing Inspector</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Dissects URL shortening, raw IP host destinations, suspicious credential-harvesting subdomains, and threat-intel flags safely.
              </p>
              <Link to="/url-scanner" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                <span>Inspect URL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 6: Community Alerts */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Community Scam Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Crowdsourced recruitment threat reporting with automated PII masking (preserving privacy) and duplicate detection.
              </p>
              <Link to="/community-alerts" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                <span>Browse Alerts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Fraud Awareness Section */}
      <section className="py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono font-bold mb-4">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>STUDENT ALERT: TOP RECRUITMENT SCAM PATTERNS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Four Signals of Recruitment Fraud
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Scammers target students through LinkedIn, WhatsApp, and Telegram. Never proceed if you observe these standard warning patterns:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✕</span>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Registration or Training Fees:</strong> Legitimate companies absorb all training and equipment costs.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✕</span>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Direct Offer Without Interview:</strong> No genuine tech or enterprise firm hires without screening technical competence.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✕</span>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Unrelated Public Webmail:</strong> Recruiters claiming to work for Microsoft, TCS, or Google who communicate via @gmail.com or @yahoo.com.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✕</span>
                  <div className="text-xs text-slate-300">
                    <strong className="text-white">Manufactured Urgency:</strong> Threatening that your offer will expire in 2 hours unless you make a deposit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-16 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Privacy & Data Protection First</h3>
          <p className="max-w-2xl mx-auto text-xs text-slate-400 leading-relaxed">
            JOBTRUST enforces rigorous data protection: applicant phone numbers and personal emails submitted to community reports are automatically masked, uploaded documents are stored under randomized cryptographic tokens, and automated heuristics never browse arbitrary user URLs blindly.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 mt-auto border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider text-white">JOBTRUST</span>
            <span className="text-xs text-slate-400">| Vedathon Open Innovation Hackathon</span>
          </div>

          <div className="text-xs text-slate-400 text-center sm:text-right">
            AI-Powered Recruitment Fraud Intelligence Platform &bull; Built with FastAPI, Scikit-learn & React.
          </div>
        </div>
      </footer>
    </div>
  );
}
