import React, { useState } from "react";
import { 
  X, 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Target, 
  Award, 
  ExternalLink 
} from "lucide-react";
import { ResumeAnalysis, requestResumeAnalysis, Opportunity } from "@/lib/api";
import { uploadResumeToSupabase } from "@/lib/supabase";

interface ResumeAnalyzerModalProps {
  onClose: () => void;
  onSelectOpportunity?: (oppId: number) => void;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  onClose,
  onSelectOpportunity,
}) => {
  const [targetRole, setTargetRole] = useState("Fullstack SDE");
  const [resumeText, setResumeText] = useState(
    "Aarav Sharma | B.Tech Computer Science (IIT Delhi, 2026 Batch)\n" +
    "Skills: Python, FastAPI, React, TypeScript, Docker, PostgreSQL, Machine Learning, PyTorch, Git, REST APIs, Tailwind CSS.\n" +
    "Projects: Distributed IoT Telemetry Engine with FastAPI; Real-time Ethereum Account Abstraction Explorer built in Next.js.\n" +
    "Experience: 2x National Hackathon Winner (Smart India Hackathon finalist), open-source contributor to PyTorch ecosystem."
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadingFile(true);

    try {
      // Upload to Supabase storage if available
      await uploadResumeToSupabase(file, "student-1");

      // Read text from file
      const text = await file.text();
      if (text && text.trim().length > 20) {
        setResumeText(text);
      }
    } catch (err) {
      console.warn("File read error, using sample text", err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoadingAnalysis(true);
    try {
      const res = await requestResumeAnalysis(resumeText, targetRole);
      setAnalysis(res);
    } catch (err) {
      console.error("Resume analysis error", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">AI Resume Analyzer</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Supabase & Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your resume, select target role, and get ATS fit score with personalized skill gap recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Target Role & File Upload Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-extrabold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">
                Target Career Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
              >
                <option value="Fullstack SDE">Fullstack SDE</option>
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend & Cloud Engineer">Backend & Cloud Engineer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="Mobile App Developer">Mobile App Developer</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">
                Upload Resume (PDF, DOCX, TXT)
              </label>
              <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl bg-indigo-50/50 text-indigo-700 font-bold cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>{selectedFile ? selectedFile.name : "Upload to Supabase Storage"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Resume Content Preview */}
          <div>
            <label className="font-extrabold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">
              Extracted Resume Text / Work History
            </label>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 bg-slate-50 font-mono"
              placeholder="Paste or review your resume text here..."
            />
          </div>

          {/* Action Trigger */}
          <div>
            <button
              onClick={handleAnalyze}
              disabled={loadingAnalysis}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loadingAnalysis ? "Evaluating with AI Engine..." : "Analyze Resume for " + targetRole}</span>
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in">
              
              {/* Score Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    Combined Role Fit Score
                  </span>
                  <p className="text-4xl font-black text-indigo-900 mt-1">
                    {analysis.combined_score}%
                  </p>
                  <span className="text-[10px] font-semibold text-indigo-600 mt-1 block">
                    Target: {analysis.target_role}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    ATS Keyword Compatibility
                  </span>
                  <p className="text-4xl font-black text-emerald-900 mt-1">
                    {analysis.ats_score}%
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
                    Top Tier Parsable
                  </span>
                </div>
              </div>

              {/* Summary Verdict */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  AI Evaluation Verdict:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {analysis.summary_verdict}
                </p>
              </div>

              {/* Skills breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 block mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Detected Core Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.found_skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-700 block mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Critical Missing Keywords / Gaps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missing_skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Next Opportunities */}
              {analysis.recommended_opportunities.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-extrabold text-slate-800 block mb-2">
                    Recommended Verified Opportunities for Your Resume:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.recommended_opportunities.map(opp => (
                      <div 
                        key={opp.id} 
                        onClick={() => {
                          onClose();
                          if (onSelectOpportunity) onSelectOpportunity(opp.id);
                        }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold text-slate-900 truncate">{opp.title}</p>
                          <p className="text-[10px] text-slate-500">{opp.organizer} • {opp.prize_description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
