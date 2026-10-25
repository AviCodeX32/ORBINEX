import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Clock, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Sparkles
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
  // Grab top 3 hackathons / flagship opportunities
  const topHackathons = opportunities
    .filter((o) => o.category === "hackathon" || o.is_featured || o.category === "fellowship")
    .slice(0, 3);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll timer
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

  // Determine corresponding image for the opportunity
  const getBannerImage = (opp: Opportunity, idx: number) => {
    const title = opp.title.toLowerCase();
    if (title.includes("smart india") || title.includes("sih")) {
      return "/banners/sih_banner.jpg";
    }
    if (title.includes("eth") || title.includes("ethereum") || title.includes("web3")) {
      return "/banners/eth_banner.webp";
    }
    if (title.includes("google") || title.includes("gsoc") || title.includes("summer of code")) {
      return "/banners/gsoc_banner.png";
    }
    const defaultBanners = [
      "/banners/sih_banner.jpg",
      "/banners/eth_banner.webp",
      "/banners/gsoc_banner.png",
    ];
    return defaultBanners[idx % defaultBanners.length];
  };

  const currentBanner = getBannerImage(current, currentIndex);

  const deadlineDate = new Date(current.deadline);
  const now = new Date();
  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onSelect(current)}
      className="relative overflow-hidden rounded-3xl border border-slate-300 shadow-md cursor-pointer group transition-all h-[320px] sm:h-[340px] w-full flex flex-col justify-between"
      style={{
        backgroundImage: `url(${currentBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dynamic gradient overlay to ensure photo visibility while guaranteeing high contrast text */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-950/20 pointer-events-none transition-opacity duration-300" />

      {/* Main Content Area - Consistent Height and Layout */}
      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full text-white">
        
        {/* Top Tag & Organizer */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Opportunity
            </span>
            <span className="bg-black/40 backdrop-blur-sm border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
              {current.organizer}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold shadow-sm backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>{current.trust_score}% Verified</span>
          </div>
        </div>

        {/* Center: Title & Description */}
        <div className="my-auto max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors drop-shadow-sm line-clamp-2">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow-xs max-w-xl">
            {current.short_description}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-200 pt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {current.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Clock className="w-3.5 h-3.5" />
              {diffDays > 0 ? `${diffDays} days left` : "Ending soon"}
            </span>
            <span>•</span>
            <span className="font-extrabold text-emerald-300">
              {current.prize_description}
            </span>
          </div>
        </div>

        {/* Bottom Bar: Action & Slide Navigation */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/20">
          
          {/* Action CTA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(current);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Explore Details & AI Prep</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Slide Indicator & Controls */}
          <div className="flex items-center gap-3">
            {/* Indicators */}
            <div className="flex items-center gap-1.5">
              {topHackathons.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx 
                      ? "w-7 bg-blue-500" 
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-white transition-colors cursor-pointer"
                title="Previous Opportunity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/20 text-white transition-colors cursor-pointer"
                title="Next Opportunity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
