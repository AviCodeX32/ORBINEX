import React from "react";
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Award, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";
import { Opportunity } from "@/lib/api";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect: (opp: Opportunity) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  // Days remaining calculation
  const deadlineDate = new Date(opportunity.deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpiringSoon = diffDays > 0 && diffDays <= 7;
  const isExpired = diffDays <= 0;

  // Category styling
  const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
    hackathon: { bg: "bg-purple-50 border-purple-200 text-purple-700", text: "text-purple-700", label: "Hackathon" },
    internship: { bg: "bg-sky-50 border-sky-200 text-sky-700", text: "text-sky-700", label: "Internship" },
    scholarship: { bg: "bg-amber-50 border-amber-200 text-amber-800", text: "text-amber-800", label: "Scholarship" },
    fellowship: { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", text: "text-emerald-700", label: "Fellowship" },
    coding_contest: { bg: "bg-rose-50 border-rose-200 text-rose-700", text: "text-rose-700", label: "Coding Contest" },
  };

  const currentCategory = categoryStyles[opportunity.category] || categoryStyles.hackathon;
  const isVerified = opportunity.verification_status === "VERIFIED_OFFICIAL";

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between p-4 cursor-pointer group"
    >
      <div>
        {/* Header Row: Category Pill & Verified Check & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentCategory.bg}`}>
              {currentCategory.label}
            </span>

            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}

            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 capitalize">
              {opportunity.mode}
            </span>
          </div>

          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(opportunity);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-blue-600 text-blue-600" : ""}`} />
            </button>
          )}
        </div>

        {/* Organizer info */}
        <p className="text-xs font-semibold text-slate-500 mb-1 truncate">
          {opportunity.organizer}
        </p>

        {/* Opportunity Title */}
        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-3">
          {opportunity.title}
        </h3>
      </div>

      {/* Key Minimal Stats: Prize & Countdown */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Prizes / Stipend</span>
          <span className="font-extrabold text-slate-800 truncate max-w-[140px] block">
            {opportunity.prize_description}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deadline</span>
          <span className={`font-bold flex items-center gap-1 justify-end ${
            isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-emerald-700"
          }`}>
            <Clock className="w-3 h-3" />
            <span>{isExpired ? "Closed" : `${diffDays} days left`}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
