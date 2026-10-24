import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Award, Clock, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Opportunity } from "@/lib/api";

interface HackathonCarouselProps {
  opportunities: Opportunity[];
  onSelect: (opp: Opportunity) => void;
}

export const HackathonCarousel: React.FC<HackathonCarouselProps> = ({
  opportunities,
  onSelect,
}) => {
  const topHackathons = opportunities
    .filter(o => o.category === "hackathon" || o.is_featured)
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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % topHackathons.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + topHackathons.length) % topHackathons.length);
  };

  const deadlineDate = new Date(current.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Featured Pill & Title */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Featured Hackathon #{currentIndex + 1}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Auto-slides every 5s
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
            {current.short_description}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-1 flex-wrap">
            <span className="font-bold text-white">{current.organizer}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {current.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              {diffDays > 0 ? `${diffDays} days left` : "Ending Today"}
            </span>
          </div>
        </div>

        {/* Right Side: Prize & Action Button */}
        <div className="flex flex-col sm:items-end justify-between gap-4 shrink-0">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center sm:justify-end gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Prize Pool
            </span>
            <p className="text-xl font-black text-white mt-0.5">
              {current.prize_description}
            </p>
          </div>

          <button
            onClick={() => onSelect(current)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Explore Challenge Details</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>

      {/* Carousel Controls: Arrows & Indicators */}
      <div className="relative z-10 flex items-center justify-between mt-6 pt-4 border-t border-white/10">
        
        {/* Indicators */}
        <div className="flex items-center gap-1.5">
          {topHackathons.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentIndex === idx ? "w-8 bg-blue-500" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
