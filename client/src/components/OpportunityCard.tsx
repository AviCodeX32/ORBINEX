import React, { useState } from "react";
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Award, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Zap,
  Users
} from "lucide-react";
import { Opportunity, trackOpportunityClick } from "@/lib/api";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onOpenDetails: (opp: Opportunity) => void;
  onOpenAIPrep: (opp: Opportunity) => void;
  onTrack: (opp: Opportunity) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (opp: Opportunity) => void;
  isAlreadyTracked?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onOpenDetails,
  onOpenAIPrep,
  onTrack,
  isBookmarked = false,
  onToggleBookmark,
  isAlreadyTracked = false,
}) => {
  const [showEvidenceTooltip, setShowEvidenceTooltip] = useState(false);

  // Calculate days remaining
  const deadlineDate = new Date(opportunity.deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpiringSoon = diffDays > 0 && diffDays <= 7;
  const isExpired = diffDays <= 0;

  // Category Pill styling
  const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
    hackathon: { bg: "bg-purple-50 border-purple-200 text-purple-700", text: "text-purple-700", label: "Hackathon" },
    internship: { bg: "bg-sky-50 border-sky-200 text-sky-700", text: "text-sky-700", label: "Internship" },
    scholarship: { bg: "bg-amber-50 border-amber-200 text-amber-800", text: "text-amber-800", label: "Scholarship" },
    fellowship: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", text: "text-emerald-700", label: "Fellowship" },
    coding_contest: { bg: "bg-rose-50 border-rose-200 text-rose-700", text: "text-rose-700", label: "Coding Contest" },
    grant: { bg: "bg-indigo-50 border-indigo-200 text-indigo-700", text: "text-indigo-700", label: "Grant" },
  };

  const currentCategory = categoryStyles[opportunity.category] || categoryStyles.hackathon;

  // Verification status styling
  const isVerified = opportunity.verification_status === "VERIFIED_OFFICIAL";
  const isUnderReview = opportunity.verification_status === "UNDER_REVIEW";
  const isFlagged = opportunity.verification_status === "FLAGGED";

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackOpportunityClick(opportunity.id);
    window.open(opportunity.direct_registration_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative group bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      
      {/* Top Banner accent if featured */}
      {opportunity.is_featured && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            FEATURED VERIFIED OPPORTUNITY
          </span>
          <span className="text-blue-100 font-normal">Source: {opportunity.source_platform}</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        
        {/* Header Row: Category, Verified Badge & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Category Pill */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentCategory.bg}`}>
              {currentCategory.label}
            </span>

            {/* Mode Pill */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
              {opportunity.mode}
            </span>

            {/* Trust Score & Verification Badge */}
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowEvidenceTooltip(true)}
                onMouseLeave={() => setShowEvidenceTooltip(false)}
                onClick={() => setShowEvidenceTooltip(!showEvidenceTooltip)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                  isVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                    : isUnderReview
                    ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                    : "bg-rose-50 text-rose-700 border-rose-300"
                }`}
              >
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{opportunity.trust_score}% Verified</span>
                  </>
                ) : isUnderReview ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Under Review</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Flagged</span>
                  </>
                )}
              </button>

              {/* Tooltip / Evidence Card */}
              {showEvidenceTooltip && (
                <div className="absolute left-0 top-full mt-1.5 w-72 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-30 text-xs text-slate-700 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-2">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <ShieldCheck className="w-4 h-4" />
                      Verification Audit Trail
                    </span>
                    <span className="text-[10px] text-slate-400">Trust Score {opportunity.trust_score}/100</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Direct official registration URL authenticated</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Organizer identity: {opportunity.organizer}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Zero application fees / Free student entry confirmed</span>
                    </li>
                  </ul>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Audit by ORBINEX Source Engine</span>
                    <span>100% Genuine</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(opportunity)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Bookmark Opportunity"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-blue-600 text-blue-600" : ""}`} />
            </button>
          )}
        </div>

        {/* Opportunity Title & Organizer */}
        <div className="mb-3">
          <h3 
            onClick={() => onOpenDetails(opportunity)}
            className="text-base font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
          >
            {opportunity.title}
          </h3>
          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
            <span className="font-semibold text-slate-700">{opportunity.organizer}</span>
            <span>•</span>
            <span className="text-slate-500 flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {opportunity.location}
            </span>
          </p>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {opportunity.short_description}
        </p>

        {/* Key Stats Row: Prize/Stipend & Deadline */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500" />
              Prizes / Stipend
            </span>
            <p className="text-xs font-extrabold text-slate-900 truncate mt-0.5">
              {opportunity.prize_description}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              Deadline
            </span>
            <p className={`text-xs font-extrabold truncate mt-0.5 ${
              isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-emerald-700"
            }`}>
              {isExpired ? "Applications Closed" : `${diffDays} days left`}
            </p>
          </div>
        </div>

        {/* AI Personalized Match Pill */}
        {opportunity.match_score !== undefined && (
          <div className="mb-3 p-2 rounded-lg bg-blue-50/70 border border-blue-200/60 flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
              ⚡
            </div>
            <div className="text-[11px] text-blue-900">
              <span className="font-bold text-blue-800">{opportunity.match_score}% Match:</span>{" "}
              <span className="text-blue-950/80 line-clamp-1">
                {opportunity.match_reason || "Aligned with your degree, skills and interests"}
              </span>
            </div>
          </div>
        )}

        {/* Skills Required Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-2">
          {opportunity.skills_required.slice(0, 4).map((skill, idx) => (
            <span 
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
            >
              {skill}
            </span>
          ))}
          {opportunity.skills_required.length > 4 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{opportunity.skills_required.length - 4} more
            </span>
          )}
        </div>

      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
        
        <button
          onClick={() => onOpenDetails(opportunity)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
        >
          Details
        </button>

        <div className="flex items-center gap-1.5">
          {/* AI Prep Button */}
          <button
            onClick={() => onOpenAIPrep(opportunity)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all shadow-2xs"
            title="Generate AI Playbook & Tailored SOP"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Prep</span>
          </button>

          {/* Track Button */}
          <button
            onClick={() => onTrack(opportunity)}
            disabled={isAlreadyTracked}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-2xs ${
              isAlreadyTracked
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isAlreadyTracked ? "text-emerald-500" : "text-slate-400"}`} />
            <span>{isAlreadyTracked ? "Tracked" : "Track"}</span>
          </button>

          {/* Direct Apply Button */}
          <button
            onClick={handleApplyClick}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs hover:shadow-blue-500/20"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>

    </div>
  );
};

