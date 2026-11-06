import React, { useState, useEffect } from 'react';
import {
  AlertOctagon, ShieldAlert, Send, Lock, CheckCircle2, AlertTriangle,
  Building2, Globe, Mail, Search, Users
} from 'lucide-react';
import { submitCommunityReport, getCommunityReports } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function CommunityReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [recruiterContact, setRecruiterContact] = useState('');
  const [evidenceText, setEvidenceText] = useState('');

  const loadReports = async () => {
    try {
      const data = await getCommunityReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load community reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!companyName.trim() || !description.trim()) {
      setErrorMsg('Please provide company name and description of the suspicious activity.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await submitCommunityReport({
        company_name: companyName.trim(),
        job_title: jobTitle.trim() || undefined,
        description: description.trim(),
        website: website.trim() || undefined,
        recruiter_contact: recruiterContact.trim() || undefined,
        evidence_text: evidenceText.trim() || undefined,
      });

      setSuccessMsg('Report submitted successfully! Contact information has been automatically masked for privacy.');
      setCompanyName('');
      setJobTitle('');
      setDescription('');
      setWebsite('');
      setRecruiterContact('');
      setEvidenceText('');
      loadReports();
    } catch (err) {
      console.error('Submit report error:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) =>
    r.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.job_title && r.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <AlertOctagon className="w-6 h-6 text-orange-400" />
                <span>Community Scam Alerts & Reporting</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 font-semibold">
                CROWDSOURCED INTEL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Warn fellow students and job seekers about active advance-fee recruitment scams. PII is strictly masked before publication.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <ShieldAlert className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Report Suspicious Activity
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                    Company / Firm Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Global Solutions"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                    Job / Internship Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Remote Data Entry Intern"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                    Website or Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. apex-jobs-portal.xyz"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                    Recruiter Contact (Email/Phone)
                  </label>
                  <input
                    type="text"
                    value={recruiterContact}
                    onChange={(e) => setRecruiterContact(e.target.value)}
                    placeholder="e.g. hr@gmail.com or +91-9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Automatically masked to protect privacy before public display.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 font-mono">
                    Description of Suspicious Action <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what occurred (e.g. demanded ₹2,000 for training kit, promised guaranteed job without interview, blocked number after transfer)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-600"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 hover:from-orange-400 hover:to-amber-300 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Alert...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Scam Alert</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community reports by company, role, or keyword..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>

            {/* Privacy Disclaimer Notice */}
            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-slate-300">Privacy Safeguard & Legal Notice:</strong> All personal phone numbers and emails are automatically masked. Reports represent user-submitted allegations and do not constitute legal determinations of fraud.
              </div>
            </div>

            {/* Reports List */}
            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                Loading community intelligence feed...
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                No matching reports found.
              </div>
            ) : (
              filteredReports.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-md space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 font-semibold block">REPORT #{r.id}</span>
                      <h4 className="text-sm font-bold text-white">{r.company_name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        {r.moderation_status}
                      </span>
                    </div>
                  </div>

                  {r.job_title && (
                    <div className="text-xs text-slate-300 font-medium">
                      Role Claimed: <span className="text-white">{r.job_title}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    {r.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center gap-3">
                      {r.website_domain && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Globe className="w-3 h-3 text-slate-500" />
                          {r.website_domain}
                        </span>
                      )}
                      {r.masked_contact && (
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {r.masked_contact}
                        </span>
                      )}
                    </div>
                    <span className="font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
