import React, { useState } from 'react';
import {
  FileSearch, UploadCloud, FileText, AlertTriangle, ShieldCheck,
  ShieldAlert, Download, DollarSign, Calendar, Mail, User, Building2
} from 'lucide-react';
import { analyzeOfferLetter, getPdfReportDownloadUrl } from '../services/api';
import RiskMeter from '../components/RiskMeter';
import EvidenceCard from '../components/EvidenceCard';
import RiskBadge from '../components/RiskBadge';

export default function OfferLetterPage() {
  const [file, setFile] = useState(null);
  const [claimedCompany, setClaimedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file) {
      setError('Please select an offer letter file (PDF, PNG, or JPG).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (claimedCompany.trim()) {
        formData.append('claimed_company', claimedCompany.trim());
      }

      const data = await analyzeOfferLetter(formData);
      setResult(data);
    } catch (err) {
      console.error('Offer letter error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze offer letter document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Offer Letter Forensics & OCR</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                MODULE 4: DOCUMENT ANALYSIS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Extracts entities from PDF & image documents to detect refundable caution fees, spoofed HR contacts, and manipulated templates.
            </p>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Claimed Company (Optional)
              </label>
              <input
                type="text"
                value={claimedCompany}
                onChange={(e) => setClaimedCompany(e.target.value)}
                placeholder="e.g. Microsoft, Infosys, Amazon"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-8 text-center transition-all bg-slate-950/50">
              <input
                type="file"
                id="offer-file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="offer-file" className="cursor-pointer flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3 shadow-md shadow-cyan-950/50">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  {file ? file.name : 'Click or drag offer letter file to upload'}
                </div>
                <p className="text-xs text-slate-500">
                  Supported formats: PDF, PNG, JPG (Max 15MB)
                </p>
                {file && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-800">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{(file.size / 1024).toFixed(1)} KB selected</span>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Uploaded files are stored under cryptographic hashes for security.
              </span>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Text & Forensics...</span>
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4" />
                    <span>Verify Offer Letter</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 pt-4">
            <RiskMeter
              score={result.risk_assessment.score}
              category={result.risk_assessment.category}
            />

            {/* Extracted Data Card */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                OCR & Lexical Extracted Document Entities
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Candidate Name</span>
                  <span className="font-semibold text-white">
                    {result.extracted_data.candidate_name || 'Not detected'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Company / Issuer</span>
                  <span className="font-semibold text-white">
                    {result.extracted_data.company_name || claimedCompany || 'Not detected'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Designation</span>
                  <span className="font-semibold text-white">
                    {result.extracted_data.job_title || 'Offered Role'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Offered CTC / Stipend</span>
                  <span className="font-semibold text-white">
                    {result.extracted_data.salary_offered || 'Not explicitly stated'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Joining Date</span>
                  <span className="font-semibold text-white">
                    {result.extracted_data.joining_date || 'Not stated'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">HR Contact Email</span>
                  <span className="font-semibold font-mono text-cyan-300">
                    {result.extracted_data.hr_contact_email || 'None listed'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Offer Reference #</span>
                  <span className="font-semibold font-mono text-white">
                    {result.extracted_data.offer_ref_number || 'None found'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${
                  result.extracted_data.payment_requested
                    ? 'bg-red-950/40 border-red-800 text-red-300 font-bold'
                    : 'bg-slate-950/80 border-slate-800 text-emerald-400'
                }`}>
                  <span className="text-[10px] font-mono uppercase block mb-1">Advance Fee Clause</span>
                  <span>
                    {result.extracted_data.payment_requested || 'None detected (Safe)'}
                  </span>
                </div>
              </div>

              {/* Raw text preview */}
              {result.extracted_data.raw_text_preview && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Document Text Preview</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-[11px] font-mono text-slate-400 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {result.extracted_data.raw_text_preview}
                  </div>
                </div>
              )}
            </div>

            {/* Findings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Document Forensic Evidence ({result.risk_assessment.findings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.risk_assessment.findings.map((f, idx) => (
                  <EvidenceCard key={idx} finding={f} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs text-slate-400">
                JOBTRUST Audit ID: <span className="font-mono text-cyan-400">{result.scan_id.slice(0, 16)}</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={getPdfReportDownloadUrl(result.scan_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audit PDF</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
