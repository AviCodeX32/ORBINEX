import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Compass, 
  ArrowRight,
  TrendingUp,
  RotateCcw
} from "lucide-react";

import { 
  Opportunity, 
  ApplicationTracker, 
  fetchOpportunities, 
  fetchApplications, 
  addToTracker 
} from "@/lib/api";

import { Navbar } from "@/components/Navbar";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunityDetailModal } from "@/components/OpportunityDetailModal";
import { ApplicationTrackerView } from "@/components/ApplicationTrackerView";
import { AIAssistantView } from "@/components/AIAssistantView";
import { AdminView } from "@/components/AdminView";
import { PartnerView } from "@/components/PartnerView";
import { ProfileView } from "@/components/ProfileView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("discover");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFreeOnly, setIsFreeOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("recommended");

  // Modals & AI Drawer
  const [detailOpportunity, setDetailOpportunity] = useState<Opportunity | null>(null);
  const [aiSelectedOppId, setAiSelectedOppId] = useState<number | null>(null);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Load Opportunities & Tracker data
  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await fetchOpportunities({
        q: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        mode: selectedMode !== "all" ? selectedMode : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        is_free: isFreeOnly ? true : undefined,
        sort: sortBy,
      });
      setOpportunities(data);
    } catch (err) {
      console.error("Failed to load opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await fetchApplications();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load applications", err);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [searchQuery, selectedCategory, selectedMode, selectedStatus, isFreeOnly, sortBy]);

  useEffect(() => {
    loadApplications();
  }, []);

  // Quick Action Handlers
  const handleOpenDetails = (opp: Opportunity) => {
    setDetailOpportunity(opp);
  };

  const handleOpenAIPrep = (opp: Opportunity) => {
    setAiSelectedOppId(opp.id);
    setActiveTab("ai");
  };

  const handleTrackOpportunity = async (opp: Opportunity) => {
    try {
      await addToTracker({
        opportunity_id: opp.id,
        status: "SAVED",
        notes: `Tracked from Discover feed on ${new Date().toLocaleDateString()}`
      });
      await loadApplications();
    } catch (err) {
      console.error("Failed to track opportunity", err);
    }
  };

  const handleToggleBookmark = (opp: Opportunity) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(opp.id)) next.delete(opp.id);
      else next.add(opp.id);
      return next;
    });
  };

  const trackedOpportunityIds = new Set(applications.map(a => a.opportunity_id));

  // Category navigation tabs (Unstop / Devfolio style)
  const categories = [
    { id: "all", label: "All Opportunities" },
    { id: "hackathon", label: "Hackathons" },
    { id: "internship", label: "Internships" },
    { id: "scholarship", label: "Scholarships" },
    { id: "fellowship", label: "Fellowships" },
    { id: "coding_contest", label: "Coding Contests" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        trackedCount={applications.length}
        pendingReviewsCount={1}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ========================================================= */}
        {/* VIEW 1: DISCOVER FEED                                     */}
        {/* ========================================================= */}
        {activeTab === "discover" && (
          <div className="space-y-6">
            
            {/* Hero Banner Strip (Inspired by Unstop & Devfolio) */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Discover → Verify → Personalize → Act → Learn</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Discover Genuine Opportunities. <br className="hidden sm:inline" />
                  Verified Evidence. Personalized to Your Skills.
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 leading-relaxed max-w-2xl">
                  Unified aggregation across Unstop, Devfolio, Devpost, AICTE, and premier tech ecosystems. Every opportunity is audited for verified registration endpoints, authentic prize pools, and zero fake listings.
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Listings</span>
                    <p className="text-lg font-black text-slate-900">{opportunities.length}+ Active</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Rate</span>
                    <p className="text-lg font-black text-emerald-600">98.4% Audited</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prizes & Grants</span>
                    <p className="text-lg font-black text-blue-600">₹1.8 Cr+ Pool</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fake Listings</span>
                    <p className="text-lg font-black text-slate-900">0 Filtered</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Pills Navigation (Unstop style) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Faceted Filters & Sorting Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-700">
              
              <div className="flex items-center gap-3 flex-wrap">
                
                {/* Mode Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Mode:</span>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="all">All Modes</option>
                    <option value="online">Online / Remote</option>
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Verification:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                  >
                    <option value="all">All Listings</option>
                    <option value="VERIFIED_OFFICIAL">Verified Official Only</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                  </select>
                </div>

                {/* Free Only Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFreeOnly}
                    onChange={(e) => setIsFreeOnly(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Free Participation Only</span>
                </label>

              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="recommended">Personalized Match (Default)</option>
                  <option value="deadline">Deadline (Closing Soonest)</option>
                  <option value="prize">Highest Prize / Stipend</option>
                  <option value="newest">Recently Discovered</option>
                </select>
              </div>

            </div>

            {/* Opportunities Feed Grid */}
            {loading ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-600">Fetching verified opportunities & calculating match scores...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching opportunities found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query, mode, or category filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedMode("all");
                    setSelectedStatus("all");
                    setIsFreeOnly(false);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {opportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onOpenDetails={handleOpenDetails}
                    onOpenAIPrep={handleOpenAIPrep}
                    onTrack={handleTrackOpportunity}
                    isBookmarked={bookmarkedIds.has(opp.id)}
                    onToggleBookmark={handleToggleBookmark}
                    isAlreadyTracked={trackedOpportunityIds.has(opp.id)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: APPLICATION TRACKER                               */}
        {/* ========================================================= */}
        {activeTab === "tracker" && (
          <ApplicationTrackerView
            applications={applications}
            onRefresh={loadApplications}
            onOpenDetails={handleOpenDetails}
            onOpenAIPrep={handleOpenAIPrep}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 3: AI ASSISTANT & PLAYBOOK                           */}
        {/* ========================================================= */}
        {activeTab === "ai" && (
          <AIAssistantView
            opportunities={opportunities}
            selectedOppId={aiSelectedOppId}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 4: ADMIN GOVERNANCE & VERIFICATION                   */}
        {/* ========================================================= */}
        {activeTab === "admin" && <AdminView />}

        {/* ========================================================= */}
        {/* VIEW 5: PARTNER & COLLEGES PORTAL                         */}
        {/* ========================================================= */}
        {activeTab === "partner" && <PartnerView />}

        {/* ========================================================= */}
        {/* VIEW 6: STUDENT PROFILE & PREFERENCES                     */}
        {/* ========================================================= */}
        {activeTab === "profile" && <ProfileView />}

      </main>

      {/* Opportunity Detail Modal */}
      {detailOpportunity && (
        <OpportunityDetailModal
          opportunity={detailOpportunity}
          onClose={() => setDetailOpportunity(null)}
          onOpenAIPrep={handleOpenAIPrep}
          onTrack={handleTrackOpportunity}
          isAlreadyTracked={trackedOpportunityIds.has(detailOpportunity.id)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight">ORBINEX</span>
            <span>•</span>
            <span>AI-Powered Opportunity Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>Discover → Verify → Personalize → Act → Learn</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">100% Verified Sources</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
