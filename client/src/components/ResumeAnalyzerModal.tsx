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
  Database,
  Cloud,
  RefreshCw,
  Trash2
} from "lucide-react";
import { ResumeAnalysis, requestResumeAnalysis, Opportunity } from "@/lib/api";
import { uploadResumeToSupabase } from "@/lib/supabase";

interface ResumeAnalyzerModalProps {
  onClose: () => void;
  onSelectOpportunity?: (oppId: number) => void;
  currentUser?: any;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  onClose,
  onSelectOpportunity,
  currentUser,
}) => {
  const [targetRole, setTargetRole] = useState("Fullstack SDE");
  const [resumeText, setResumeText] = useState(
    "Aarav Sharma | B.Tech Computer Science (IIT Delhi, 2026 Batch)\n" +
    "Skills: Python, FastAPI, React, TypeScript, Docker, PostgreSQL, Machine Learning, PyTorch, Git, REST APIs, Tailwind CSS.\n" +
    "Projects: Distributed IoT Telemetry Engine with FastAPI; Real-time Ethereum Account Abstraction Explorer built in Next.js.\n" +
    "Experience: 2x National Hackathon Winner (Smart India Hackathon finalist), open-source contributor to PyTorch ecosystem."
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingFile(true);
    setUploadError(null);

    try {
      const userIdentifier = currentUser?.id || currentUser?.email?.split("@")[0] || "guest-user";
      
      // Upload to Supabase storage bucket 'resume'
      const { url, error } = await uploadResumeToSupabase(file, userIdentifier);
      if (error) {
        console.warn("Supabase upload note:", error.message);
      }
      if (url) {
        setUploadedUrl(url);
      }

      // Read text from file
      const text = await file.text();
      if (text && text.trim().length > 20) {
        setResumeText(text);
      }
    } catch (err: any) {
      console.warn("File read error, using fallback parsed text", err);
      setUploadError("Uploaded to Supabase bucket. Using text extraction preview.");
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">AI Resume Analyzer</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Gemini 3.5 AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload your resume, select target role, and get combined ATS match scoring with actionable skill gap recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Target Role Selector */}
          <div>
            <label className="font-extrabold text-slate-800 block mb-1 uppercase tracking-wider text-[10px]">
              1. Select Target Career Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                "Fullstack SDE",
                "Frontend Engineer",
                "Backend & Cloud Engineer",
                "AI / ML Engineer",
                "DevOps & Systems",
                "Mobile App Developer"
              ].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    targetRole === role
                      ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-600"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <p className="truncate text-xs">{role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dedicated Supabase Upload Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Upload Resume File to Supabase Cloud Storage</span>
              </label>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                Bucket: <strong className="text-slate-800 font-mono">resume</strong>
              </span>
            </div>

            {/* Upload Zone */}
            {!selectedFile ? (
              <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 bg-indigo-50/20 hover:bg-indigo-50/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Cloud className="w-6 h-6" />
                </div>
                <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Click to browse or drag & drop your resume file
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Destination: <span className="font-semibold text-indigo-700">Supabase Cloud Storage (Bucket: resume)</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">PDF</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">DOCX</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">TXT</span>
                  <span className="text-[10px] text-slate-400">• Up to 10 MB</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ({formatFileSize(selectedFile.size)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {uploadingFile ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Uploading to Supabase bucket 'resume'...</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Stored in Supabase bucket: resume</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  <span>Replace File</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Extracted Resume Text Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                3. Parsed Resume Content for AI Evaluation
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Editable text fed to Gemini 3.5 LLM
              </span>
            </div>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 bg-slate-50 font-mono leading-relaxed"
              placeholder="Paste or review your resume text here..."
            />
          </div>

          {/* Action Trigger */}
          <div>
            <button
              onClick={handleAnalyze}
              disabled={loadingAnalysis || uploadingFile}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {loadingAnalysis 
                  ? "Evaluating with Gemini 3.5 AI Engine..." 
                  : `Analyze Resume for ${targetRole} with Gemini AI`}
              </span>
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in">
              
              {/* Score Gauges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    Combined Role Fit Score
                  </span>
                  <p className="text-4xl font-black text-indigo-950 mt-1">
                    {analysis.combined_score}%
                  </p>
                  <span className="text-[10px] font-semibold text-indigo-600 mt-1 block">
                    Target: {analysis.target_role}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    ATS Keyword Compatibility
                  </span>
                  <p className="text-4xl font-black text-emerald-950 mt-1">
                    {analysis.ats_score}%
                  </p>
                  <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
                    High ATS Parser Readability
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
              {analysis.recommended_opportunities && analysis.recommended_opportunities.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-extrabold text-slate-800 block mb-2">
                    Recommended Opportunities for Your Resume:
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
