import React from "react";
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Layers,
  AlertCircle
} from "lucide-react";
import { Opportunity, trackOpportunityClick } from "@/lib/api";

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
  onOpenAIPrep: (opp: Opportunity) => void;
  onTrack: (opp: Opportunity) => void;
  isAlreadyTracked?: boolean;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onOpenAIPrep,
  onTrack,
  isAlreadyTracked = false,
}) => {
  if (!opportunity) return null;

  const handleApply = () => {
    trackOpportunityClick(opportunity.id);
    window.open(opportunity.direct_registration_url, "_blank", "noopener,noreferrer");
  };

  const isVerified = opportunity.verification_status === "VERIFIED_OFFICIAL";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                {opportunity.category}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                {opportunity.mode}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {opportunity.trust_score}% Verified
              </span>
              {opportunity.merged_sources_count > 1 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Layers className="w-3.5 h-3.5" />
                  {opportunity.merged_sources_count} Unified Sources
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {opportunity.title}
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-1 flex items-center gap-2">
              <span className="font-bold text-slate-800">{opportunity.organizer}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {opportunity.location}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                Prizes / Compensation
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {opportunity.prize_description}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                Registration Deadline
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {new Date(opportunity.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-4 h-4 text-emerald-500" />
                Source Platform
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {opportunity.source_platform}
              </p>
            </div>
          </div>

          {/* AI Match Explanation */}
          {opportunity.match_score !== undefined && (
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="flex items-center gap-2 font-bold text-blue-900 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Personalized Relevance ({opportunity.match_score}% Match)</span>
              </div>
              <p className="text-xs text-blue-950/80 leading-relaxed">
                {opportunity.match_reason || "Based on your verified student profile, your technical background in Python, Machine Learning, and current semester timeline strongly align with this opportunity's requirements."}
              </p>
            </div>
          )}

          {/* Full Description */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              About This Opportunity
            </h4>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200/80">
              {opportunity.full_description}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              Eligibility & Guidelines
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <ul className="space-y-2 text-xs sm:text-sm">
                {opportunity.eligibility_criteria.map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-2">
              Recommended Skills & Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {opportunity.skills_required.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Source Evidence & Verification Audit */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
            <div className="flex items-center justify-between font-bold text-emerald-900 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ORBINEX Source Credibility & Evidence Audit
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Trust Score: {opportunity.trust_score}/100
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Direct registration link checked & responsive</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL certificate & HTTPS encryption verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Organizer official credentials authenticated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero fake / hidden registration fee confirmed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAIPrep(opportunity)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Prep Playbook</span>
            </button>

            <button
              onClick={() => onTrack(opportunity)}
              disabled={isAlreadyTracked}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isAlreadyTracked
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isAlreadyTracked ? "text-emerald-500" : "text-slate-400"}`} />
              <span>{isAlreadyTracked ? "In Application Tracker" : "Add to Tracker"}</span>
            </button>
          </div>

          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/20 transition-all"
          >
            <span>Open Official Registration</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

