import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  Lightbulb, 
  Target, 
  Zap, 
  Bookmark,
  Share2
} from "lucide-react";
import { 
  Opportunity, 
  MatchAnalysis, 
  PrepChecklist, 
  SOPDraft, 
  requestMatchAnalysis, 
  requestPrepChecklist, 
  requestSOPDraft, 
  trackOpportunityClick 
} from "@/lib/api";

interface DedicatedOpportunityViewProps {
  opportunity: Opportunity;
  onBack: () => void;
  onTrack: (opp: Opportunity) => void;
  isAlreadyTracked?: boolean;
}

export const DedicatedOpportunityView: React.FC<DedicatedOpportunityViewProps> = ({
  opportunity,
  onBack,
  onTrack,
  isAlreadyTracked = false,
}) => {
  const [activeAiTab, setActiveAiTab] = useState<"match" | "prep" | "sop">("match");
  
  // AI data states
  const [matchData, setMatchData] = useState<MatchAnalysis | null>(null);
  const [prepData, setPrepData] = useState<PrepChecklist | null>(null);
  const [sopData, setSopData] = useState<SOPDraft | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(true);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customTrack, setCustomTrack] = useState<string>("");

  useEffect(() => {
    const loadAiData = async () => {
      setLoadingAi(true);
      try {
        const [matchRes, prepRes, sopRes] = await Promise.all([
          requestMatchAnalysis(opportunity.id),
          requestPrepChecklist(opportunity.id),
          requestSOPDraft(opportunity.id)
        ]);
        setMatchData(matchRes);
        setPrepData(prepRes);
        setSopData(sopRes);
      } catch (err) {
        console.error("Failed to load AI opportunity intelligence", err);
      } finally {
        setLoadingAi(false);
      }
    };

    loadAiData();
  }, [opportunity.id]);

  const handleApply = () => {
    trackOpportunityClick(opportunity.id);
    window.open(opportunity.direct_registration_url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegenerateSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAi(true);
    try {
      const res = await requestSOPDraft(opportunity.id, customTrack || undefined);
      setSopData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:border-blue-400 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </button>

        <span className="text-xs text-slate-400 font-medium hidden sm:block">
          Home / {opportunity.category} / <strong className="text-slate-700">{opportunity.title}</strong>
        </span>
      </div>

      {/* Main Opportunity Hero Header Card (Unstop style) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {opportunity.category}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{opportunity.trust_score}% Verified Authentic</span>
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                {opportunity.mode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {opportunity.title}
            </h1>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
              <span className="font-extrabold text-slate-800">{opportunity.organizer}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {opportunity.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                Deadline: {new Date(opportunity.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center gap-3 shrink-0">
            <button
              onClick={handleApply}
              className="w-full sm:w-56 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => onTrack(opportunity)}
              disabled={isAlreadyTracked}
              className={`w-full sm:w-56 px-6 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isAlreadyTracked
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:text-blue-600 shadow-2xs"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isAlreadyTracked ? "text-emerald-500" : "text-slate-400"}`} />
              <span>{isAlreadyTracked ? "In Application Tracker" : "Track Application"}</span>
            </button>
          </div>

        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Prizes / Stipend</span>
            <p className="text-base font-black text-slate-900 mt-0.5">{opportunity.prize_description}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Participation Fee</span>
            <p className="text-base font-black text-emerald-600 mt-0.5">Free Participation</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Audited Source</span>
            <p className="text-base font-black text-slate-800 mt-0.5">{opportunity.source_platform}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicants / Views</span>
            <p className="text-base font-black text-blue-600 mt-0.5">{opportunity.applications_count} applied</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Details & Right Column AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Full Details & Eligibility (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* About / Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-3">
              About This Opportunity
            </h3>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              {opportunity.full_description}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-3">
              Eligibility & Guidelines
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {opportunity.eligibility_criteria.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 mb-3">
              Required Skills & Tech Stacks
            </h3>
            <div className="flex flex-wrap gap-2">
              {opportunity.skills_required.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Verification Evidence Audit */}
          <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200 p-5 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-900 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ORBINEX Source Credibility Audit
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Trust Score: {opportunity.trust_score}/100
              </span>
            </div>
            <ul className="space-y-1.5 text-emerald-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct registration URL authenticated & tested</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>HTTPS / SSL transmission encryption active</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero registration fee / verified student benefit</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: AI SECTION (5 cols) (As requested: "the ai part will show after the card opens like unstop") */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              ORBINEX AI INTELLIGENCE
            </div>
            <h3 className="text-base font-black">AI Candidate Playbook & Tailored Prep</h3>
            <p className="text-xs text-blue-100 mt-1">
              Deterministic qualification matching paired with LLM reasoning.
            </p>

            {/* AI Subtabs */}
            <div className="flex items-center gap-1 mt-4 bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => setActiveAiTab("match")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeAiTab === "match" ? "bg-white text-blue-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                Match Score
              </button>
              <button
                onClick={() => setActiveAiTab("prep")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeAiTab === "prep" ? "bg-white text-blue-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                Prep Checklist
              </button>
              <button
                onClick={() => setActiveAiTab("sop")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeAiTab === "sop" ? "bg-white text-blue-900 shadow-xs" : "text-white/80 hover:text-white"
                }`}
              >
                SOP & Pitch
              </button>
            </div>
          </div>

          {loadingAi ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Generating AI match & tailored roadmap...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* AI TAB 1: MATCH SCORECARD */}
              {activeAiTab === "match" && matchData && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Match Percentage</span>
                      <p className="text-3xl font-black text-slate-900">{matchData.overall_match_percentage}%</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      {matchData.recommendation_verdict}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-1">Why This Matches You:</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70 leading-relaxed">
                      {matchData.why_this_matches_you}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 block mb-1.5">Matched Profile Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {matchData.skills_match.matched.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-amber-700 block mb-1.5">Recommended Growth Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {matchData.skills_match.missing.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI TAB 2: PREP CHECKLIST */}
              {activeAiTab === "prep" && prepData && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 max-h-[500px] overflow-y-auto">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phase-by-Phase Preparation Milestones
                  </h4>
                  {prepData.phases.map((ph, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <span className="text-xs font-bold text-slate-900 block mb-1.5">
                        {ph.phase_name}
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {ph.actions.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* AI TAB 3: SOP & PITCH DRAFTER */}
              {activeAiTab === "sop" && sopData && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">Elevator Pitch</span>
                      <button
                        onClick={() => handleCopy(sopData.pitch_summary, "pitch")}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {copiedField === "pitch" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === "pitch" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
                      "{sopData.pitch_summary}"
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">Tailored Cover Letter</span>
                      <button
                        onClick={() => handleCopy(sopData.cover_letter_body, "sop")}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {copiedField === "sop" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === "sop" ? "Copied SOP" : "Copy"}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={8}
                      value={sopData.cover_letter_body}
                      className="w-full text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono outline-none"
                    />
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
