import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  Target, 
  Zap, 
  Award, 
  Clock, 
  Lightbulb,
  Layers
} from "lucide-react";
import { 
  Opportunity, 
  MatchAnalysis, 
  PrepChecklist, 
  SOPDraft, 
  requestMatchAnalysis, 
  requestPrepChecklist, 
  requestSOPDraft 
} from "@/lib/api";

interface AIAssistantViewProps {
  opportunities: Opportunity[];
  selectedOppId?: number | null;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  opportunities,
  selectedOppId: initialSelectedOppId,
}) => {
  const [selectedOppId, setSelectedOppId] = useState<number>(
    initialSelectedOppId || (opportunities[0]?.id ?? 1)
  );

  const [activeTab, setActiveTab] = useState<"match" | "prep" | "sop">("match");
  
  // Data states
  const [matchData, setMatchData] = useState<MatchAnalysis | null>(null);
  const [prepData, setPrepData] = useState<PrepChecklist | null>(null);
  const [sopData, setSopData] = useState<SOPDraft | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [targetTrack, setTargetTrack] = useState<string>("");

  const currentOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  useEffect(() => {
    if (initialSelectedOppId) {
      setSelectedOppId(initialSelectedOppId);
    }
  }, [initialSelectedOppId]);

  useEffect(() => {
    if (!currentOpp) return;

    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === "match") {
          const res = await requestMatchAnalysis(currentOpp.id);
          setMatchData(res);
        } else if (activeTab === "prep") {
          const res = await requestPrepChecklist(currentOpp.id);
          setPrepData(res);
        } else if (activeTab === "sop") {
          const res = await requestSOPDraft(currentOpp.id, targetTrack || undefined);
          setSopData(res);
        }
      } catch (err) {
        console.error("Failed to load AI assistance data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedOppId, activeTab, currentOpp]);

  const handleGenerateSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOpp) return;
    setLoading(true);
    try {
      const res = await requestSOPDraft(currentOpp.id, targetTrack || undefined);
      setSopData(res);
    } catch (err) {
      console.error("Failed to generate SOP", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 rounded-2xl p-6 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI OPPORTUNITY INTELLIGENCE
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            AI-Assisted Application Preparation & Playbooks
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Deterministic qualification matching paired with LLM reasoning. Evaluate skill gaps, generate tailored milestone checklists, and craft personalized statements of purpose.
          </p>
        </div>
      </div>

      {/* Selector & Tabs Navigation */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Opportunity Dropdown */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Selected Opportunity:
          </span>
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(Number(e.target.value))}
            className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
          >
            {opportunities.map(opp => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.organizer})
              </option>
            ))}
          </select>
        </div>

        {/* Intelligence Feature Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("match")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "match"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Match Scorecard</span>
          </button>

          <button
            onClick={() => setActiveTab("prep")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "prep"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Prep Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab("sop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "sop"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SOP & Pitch Drafter</span>
          </button>
        </div>

      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Analyzing criteria with ORBINEX AI Engine...</p>
        </div>
      )}

      {/* TAB 1: MATCH SCORECARD */}
      {!loading && activeTab === "match" && matchData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Overall Match Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Fit Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {matchData.overall_match_percentage}%
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  Profile Alignment
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${matchData.overall_match_percentage}%` }}
                />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200/80">
                <span className="text-xs font-bold text-blue-900 block">
                  Verdict:
                </span>
                <p className="text-xs font-medium text-blue-800 mt-0.5">
                  {matchData.recommendation_verdict}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Degree Eligibility:</span>
                <span className="font-bold text-emerald-600">Confirmed (B.Tech)</span>
              </div>
              <div className="flex justify-between">
                <span>Verified Source:</span>
                <span className="font-bold text-slate-700">{currentOpp?.source_platform}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Breakdown */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Why This Matches You */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Why This Opportunity Matches You</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                {matchData.why_this_matches_you}
              </p>
            </div>

            {/* Skills Alignment */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Skill Competency Breakdown
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Matched Skills in Your Profile
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.skills_match.matched.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s}
                      </span>
                    ))}
                    {matchData.skills_match.matched.length === 0 && (
                      <span className="text-xs text-slate-400">No direct keyword overlap</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Recommended Growth Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.skills_match.missing.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {s}
                      </span>
                    ))}
                    {matchData.skills_match.missing.length === 0 && (
                      <span className="text-xs text-emerald-600 font-semibold">100% skill coverage!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Competitive Advantage */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                Candidate Strengths
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {matchData.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: PREPARATION CHECKLIST */}
      {!loading && activeTab === "prep" && prepData && (
        <div className="space-y-6">
          
          {/* Phases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prepData.phases.map((phase, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {phase.phase_name}
                    </h4>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-700">
                    {phase.actions.map((act, actIdx) => (
                      <li key={actIdx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Key Deliverables & Suggested Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-500" />
                Required Key Deliverables
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {prepData.key_deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Insider Evaluation Tips
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {prepData.insider_tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="leading-tight">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: SOP & PITCH GENERATOR */}
      {!loading && activeTab === "sop" && sopData && (
        <div className="space-y-6">
          
          {/* Target Track Customization Form */}
          <form onSubmit={handleGenerateSOP} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Customize for Track / Specialization:
              </label>
              <input
                type="text"
                value={targetTrack}
                onChange={(e) => setTargetTrack(e.target.value)}
                placeholder="e.g. AI/ML, Cloud Infrastructure, CleanTech, Web3, Distributed Systems"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 mt-4 sm:mt-0 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Regenerate Tailored Draft</span>
            </button>
          </form>

          {/* Elevator Pitch Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                30-Second Elevator Pitch
              </span>
              <button
                onClick={() => copyToClipboard(sopData.pitch_summary, "pitch")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 transition-colors"
              >
                {copiedField === "pitch" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "pitch" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 leading-relaxed font-medium">
              "{sopData.pitch_summary}"
            </p>
          </div>

          {/* Full Cover Letter / SOP Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tailored Statement of Purpose / Cover Note
                </span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                  Subject: {sopData.subject_line}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(sopData.cover_letter_body, "sop")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 transition-colors"
              >
                {copiedField === "sop" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === "sop" ? "Copied Full SOP" : "Copy to Clipboard"}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={sopData.cover_letter_body}
              rows={12}
              className="w-full text-xs text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono leading-relaxed outline-none"
            />
          </div>

        </div>
      )}

    </div>
  );
};

