import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Clock, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Opportunity } from "@/lib/api";

interface HackathonCarouselProps {
  opportunities: Opportunity[];
  onSelect: (opp: Opportunity) => void;
}

export const HackathonCarousel: React.FC<HackathonCarouselProps> = ({
  opportunities,
  onSelect,
}) => {
  // Grab top 3 hackathons (or featured opportunities)
  const topHackathons = opportunities
    .filter((o) => o.category === "hackathon" || o.is_featured)
    .slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (topHackathons.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topHackathons.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [topHackathons.length, isPaused]);

  if (topHackathons.length === 0) return null;

  const current = topHackathons[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % topHackathons.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + topHackathons.length) % topHackathons.length);
  };

  const deadlineDate = new Date(current.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onSelect(current)}
      className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-sm cursor-pointer group transition-all"
    >
      {/* Subtle Transparent Grid Watermark Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Content Area: Minimal, high contrast, clean typography */}
        <div className="space-y-3.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Featured Challenge {currentIndex + 1} of {topHackathons.length}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Auto-slides every 5s
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {current.short_description}
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 pt-1 flex-wrap">
            <span className="font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              {current.organizer}
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {current.location}
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              {diffDays > 0 ? `${diffDays} days left` : "Closing Soon"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {current.trust_score}% Verified
            </span>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(current);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Explore Details & AI Prep</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Side: Transparent Art & Prize Box */}
        <div className="relative flex flex-col sm:items-end justify-center shrink-0">
          
          {/* Transparent SVG Vector Illustration (Isometric Hackathon Trophy & Code) */}
          <div className="hidden lg:block absolute -top-8 -right-4 w-52 h-44 pointer-events-none opacity-85">
            <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Subtle transparent base plate */}
              <ellipse cx="100" cy="140" rx="70" ry="25" fill="#3b82f6" fillOpacity="0.12" />
              <ellipse cx="100" cy="135" rx="55" ry="18" fill="#3b82f6" fillOpacity="0.18" />
              
              {/* Trophy Base */}
              <path d="M85 115 L115 115 L110 135 L90 135 Z" fill="#94a3b8" fillOpacity="0.8" />
              
              {/* Trophy Cup */}
              <path d="M70 60 C70 95 130 95 130 60 L130 50 L70 50 Z" fill="#f8fafc" fillOpacity="0.9" />
              <path d="M72 62 C72 90 128 90 128 62 L128 53 L72 53 Z" fill="#38bdf8" fillOpacity="0.3" />
              
              {/* Trophy Handles */}
              <path d="M70 55 C55 55 55 80 70 80" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M130 55 C145 55 145 80 130 80" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" fill="none" />
              
              {/* Code Brackets on Trophy */}
              <text x="92" y="74" fill="#0f172a" fontSize="16" fontWeight="bold" fontFamily="monospace">{"<>"}</text>
              
              {/* Floating tech elements with transparency */}
              <circle cx="50" cy="40" r="10" fill="#3b82f6" fillOpacity="0.25" />
              <text x="46" y="44" fill="#93c5fd" fontSize="11" fontWeight="black" fontFamily="sans-serif">★</text>
              
              <rect x="135" y="30" width="22" height="22" rx="6" fill="#10b981" fillOpacity="0.2" stroke="#34d399" strokeWidth="1.5" />
              <text x="141" y="45" fill="#6ee7b7" fontSize="11" fontWeight="bold" fontFamily="monospace">AI</text>
            </svg>
          </div>

          {/* Minimal Prize Highlight Card */}
          <div className="relative z-10 bg-slate-800/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-700/80 text-left sm:text-right min-w-[200px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center sm:justify-end gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Prize Pool & Grants
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {current.prize_description}
            </p>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              {current.is_free ? "100% Free Entry" : "Paid Entry"}
            </span>
          </div>

        </div>

      </div>

      {/* Slide Navigation Controls */}
      <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
        
        {/* Indicator dots */}
        <div className="flex items-center gap-2">
          {topHackathons.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? "w-8 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Previous / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Previous Hackathon"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Next Hackathon"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
