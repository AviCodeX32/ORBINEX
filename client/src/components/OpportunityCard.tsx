import React from "react";
import { 
  Clock, 
  MapPin, 
  Bookmark, 
  CheckCircle2, 
  ArrowUpRight,
  Briefcase
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

  // Clean category label mapping
  const categoryLabels: Record<string, string> = {
    job: "Full-Time Job",
    hackathon: "Hackathon",
    internship: "Internship",
    scholarship: "Scholarship",
    fellowship: "Fellowship",
    coding_contest: "Coding Contest",
  };

  const categoryLabel = categoryLabels[opportunity.category] || "Opportunity";
  const isVerified = opportunity.verification_status === "VERIFIED_OFFICIAL";
  const isJob = opportunity.category === "job";

  // Initials for organizer avatar
  const organizerInitials = opportunity.organizer
    ? opportunity.organizer
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "OR";

  return (
    <div
      onClick={() => onSelect(opportunity)}
      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 sm:p-6 min-h-[250px] cursor-pointer group select-none"
    >
      {/* Top Section */}
      <div className="space-y-3.5">
        
        {/* Row 1: Badges & Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Clean neutral category badge */}
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {categoryLabel}
            </span>

            {/* Verified status badge */}
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}

            {/* Mode badge */}
            <span className="text-[11px] font-medium text-slate-500 capitalize">
              • {opportunity.mode}
            </span>
          </div>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(opportunity);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
              title="Bookmark opportunity"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-slate-900 text-slate-900" : ""}`} />
            </button>
          )}
        </div>

        {/* Row 2: Organizer Info with Monogram */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
            {organizerInitials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-600 truncate">
              {opportunity.organizer}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </p>
          </div>
        </div>

        {/* Row 3: Opportunity Title */}
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {opportunity.title}
        </h3>

        {/* Row 4: Short Description with Breathing Room */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {opportunity.short_description}
        </p>

      </div>

      {/* Bottom Section: Compensation/Prize & Deadline Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            {isJob ? "CTC / Annual Package" : "Prize / Stipend"}
          </span>
          <span className="font-extrabold text-slate-900 truncate max-w-[150px] block mt-0.5">
            {opportunity.prize_description}
          </span>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Deadline
          </span>
          <span className={`font-bold flex items-center gap-1 justify-end mt-0.5 ${
            isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-slate-700"
          }`}>
            <Clock className="w-3 h-3" />
            <span>{isExpired ? "Closed" : `${diffDays} days left`}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
