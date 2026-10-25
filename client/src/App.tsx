import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Compass, 
  RotateCcw
} from "lucide-react";

import { 
  Opportunity, 
  ApplicationTracker, 
  fetchOpportunities, 
  fetchApplications, 
  addToTracker 
} from "@/lib/api";

import { 
  supabase, 
  getCurrentUser, 
  signOutUser 
} from "@/lib/supabase";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { HackathonCarousel } from "@/components/HackathonCarousel";
import { OpportunityCard } from "@/components/OpportunityCard";
import { DedicatedOpportunityView } from "@/components/DedicatedOpportunityView";
import { ApplicationTrackerView } from "@/components/ApplicationTrackerView";
import { AIAssistantView } from "@/components/AIAssistantView";
import { MentorshipView } from "@/components/MentorshipView";
import { ResumeAnalyzerModal } from "@/components/ResumeAnalyzerModal";
import { HostOpportunityModal } from "@/components/HostOpportunityModal";
import { AuthModal } from "@/components/AuthModal";
import { AdminView } from "@/components/AdminView";
import { ProfileView } from "@/components/ProfileView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Authenticated Supabase User state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Opportunities & Tracker data
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

  // Dedicated Opportunity Page State
  const [dedicatedOpp, setDedicatedOpp] = useState<Opportunity | null>(null);

  // Modals state
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [showHostModal, setShowHostModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Category navigation tabs
  const categories = [
    { id: "all", label: "All Opportunities" },
    { id: "hackathon", label: "Hackathons" },
    { id: "job", label: "Full-Time Jobs" },
    { id: "internship", label: "Internships" },
    { id: "scholarship", label: "Scholarships" },
    { id: "fellowship", label: "Fellowships" },
    { id: "coding_contest", label: "Coding Contests" },
  ];

  // Check Supabase Auth State
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  // Load Opportunities from API
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

  // Card select -> Opens dedicated full page view
  const handleSelectOpportunity = (opp: Opportunity) => {
    setDedicatedOpp(opp);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTrackOpportunity = async (opp: Opportunity) => {
    try {
      await addToTracker({
        opportunity_id: opp.id,
        status: "SAVED",
        notes: `Tracked on ${new Date().toLocaleDateString()}`
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMode("all");
    setSelectedStatus("all");
    setIsFreeOnly(false);
    setSortBy("recommended");
  };

  const isFilteringActive = 
    selectedCategory !== "all" || 
    selectedMode !== "all" || 
    selectedStatus !== "all" || 
    isFreeOnly || 
    sortBy !== "recommended";

  const trackedOpportunityIds = new Set(applications.map(a => a.opportunity_id));

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setDedicatedOpp(null);
          if (tab === "internships") {
            setSelectedCategory("internship");
            setActiveTab("home");
          } else if (tab === "competitions") {
            setSelectedCategory("hackathon");
            setActiveTab("home");
          } else if (tab === "scholarships") {
            setSelectedCategory("scholarship");
            setActiveTab("home");
          } else if (tab === "jobs") {
            setSelectedCategory("job");
            setActiveTab("home");
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenHostModal={() => setShowHostModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        trackedCount={applications.length}
        currentUser={currentUser}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar with Search Bar & AI Features */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenResumeAnalyzer={() => setShowResumeModal(true)}
          onOpenAIPrep={() => { setDedicatedOpp(null); setActiveTab("ai_prep"); }}
          onOpenHostModal={() => setShowHostModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          activeTab={activeTab}
          setActiveTab={(tab) => { setDedicatedOpp(null); setActiveTab(tab); }}
          currentUser={currentUser}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* ========================================================= */}
          {/* DEDICATED OPPORTUNITY FULL-PAGE VIEW                      */}
          {/* ========================================================= */}
          {dedicatedOpp ? (
            <DedicatedOpportunityView
              opportunity={dedicatedOpp}
              onBack={() => setDedicatedOpp(null)}
              onTrack={handleTrackOpportunity}
              isAlreadyTracked={trackedOpportunityIds.has(dedicatedOpp.id)}
            />
          ) : (
            <>
              {/* ========================================================= */}
              {/* VIEW: HOME / DISCOVER FEED                                */}
              {/* ========================================================= */}
              {activeTab === "home" && (
                <div className="space-y-6 animate-in fade-in">
                  
                  {/* IF SEARCH IS ACTIVE: Display ONLY the matching opportunities */}
                  {searchQuery.trim().length > 0 ? (
                    <div className="space-y-6">
                      
                      {/* Search Results Summary Header */}
                      <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            <h2 className="text-sm font-bold text-slate-900">
                              Search results for <span className="text-blue-600 font-extrabold">"{searchQuery}"</span>
                            </h2>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Showing {opportunities.length} opportunities matching your keyword
                          </p>
                        </div>

                        <button
                          onClick={() => setSearchQuery("")}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors self-start sm:self-auto cursor-pointer"
                        >
                          Clear Search
                        </button>
                      </div>

                      {/* Search Results Grid */}
                      {loading ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
                          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-xs font-bold text-slate-600">Searching genuine opportunities...</p>
                        </div>
                      ) : opportunities.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
                          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-base font-bold text-slate-800">
                            No opportunities matching "{searchQuery}"
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Try searching for general keywords like "hackathon", "internship", "AI", or "developer".
                          </p>
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Reset Search
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {opportunities.map((opp) => (
                            <OpportunityCard
                              key={opp.id}
                              opportunity={opp}
                              onSelect={handleSelectOpportunity}
                              isBookmarked={bookmarkedIds.has(opp.id)}
                              onToggleBookmark={handleToggleBookmark}
                            />
                          ))}
                        </div>
                      )}

                    </div>
                  ) : (
                    /* NORMAL DISCOVER FEED (NO ACTIVE SEARCH) */
                    <div className="space-y-6">
                      
                      {/* 1. Auto-scrollable 3 Latest Hackathons Hero Carousel (Consistent Size & Real Image Backgrounds) */}
                      <HackathonCarousel
                        opportunities={opportunities}
                        onSelect={handleSelectOpportunity}
                      />

                      {/* 2. Category Navigation Tabs */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer ${
                              selectedCategory === cat.id
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* 3. Comprehensive Faceted Filter Bar */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs font-semibold text-slate-700">
                        
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Mode Filter */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Mode:</span>
                            <select
                              value={selectedMode}
                              onChange={(e) => setSelectedMode(e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="all">All Modes</option>
                              <option value="online">Online / Remote</option>
                              <option value="in-person">In-Person</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </div>

                          {/* Verification Status */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Status:</span>
                            <select
                              value={selectedStatus}
                              onChange={(e) => setSelectedStatus(e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="all">All Listings</option>
                              <option value="VERIFIED_OFFICIAL">Verified Official Only</option>
                              <option value="COMMUNITY_REPORTED">Community Verified</option>
                            </select>
                          </div>

                          {/* Free Participation Only */}
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isFreeOnly}
                              onChange={(e) => setIsFreeOnly(e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span>Free Participation Only</span>
                          </label>

                          {/* Reset Filters button */}
                          {isFilteringActive && (
                            <button
                              onClick={handleResetFilters}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          )}
                        </div>

                        {/* Sort By Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Sort By:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                          >
                            <option value="recommended">Personalized Match</option>
                            <option value="deadline">Closing Soonest</option>
                            <option value="prize">Highest Prize / Stipend</option>
                            <option value="newest">Recently Discovered</option>
                          </select>
                        </div>

                      </div>

                      {/* 4. Opportunity Feed Grid */}
                      {loading ? (
                        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
                          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-xs font-bold text-slate-600">Loading verified opportunities...</p>
                        </div>
                      ) : opportunities.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
                          <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <h3 className="text-base font-bold text-slate-800">No matching opportunities found</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Try adjusting your filters or resetting them to view all opportunities.
                          </p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Verified Opportunities ({opportunities.length})
                            </span>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              Click any card to open full details & AI prep
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {opportunities.map((opp) => (
                              <OpportunityCard
                                key={opp.id}
                                opportunity={opp}
                                onSelect={handleSelectOpportunity}
                                isBookmarked={bookmarkedIds.has(opp.id)}
                                onToggleBookmark={handleToggleBookmark}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* ========================================================= */}
              {/* VIEW: MENTORSHIP VIEW                                     */}
              {/* ========================================================= */}
              {activeTab === "mentorship" && <MentorshipView />}

              {/* ========================================================= */}
              {/* VIEW: APPLICATION TRACKER VIEW                           */}
              {/* ========================================================= */}
              {activeTab === "tracker" && (
                <ApplicationTrackerView
                  applications={applications}
                  onRefresh={loadApplications}
                  onSelectOpportunity={handleSelectOpportunity}
                  onOpenAIPrep={(opp) => { handleSelectOpportunity(opp); }}
                />
              )}

              {/* ========================================================= */}
              {/* VIEW: AI ASSISTANT / PREP VIEW                            */}
              {/* ========================================================= */}
              {activeTab === "ai_prep" && (
                <AIAssistantView
                  opportunities={opportunities}
                  selectedOppId={opportunities[0]?.id}
                />
              )}

              {/* ========================================================= */}
              {/* VIEW: ADMIN CONSOLE                                       */}
              {/* ========================================================= */}
              {activeTab === "admin" && <AdminView />}

              {/* ========================================================= */}
              {/* VIEW: STUDENT PROFILE                                     */}
              {/* ========================================================= */}
              {activeTab === "profile" && <ProfileView />}

            </>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto bg-white border-t border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight">ORBINEX</span>
              <span>•</span>
              <span>AI-Powered Opportunity Intelligence Platform</span>
            </div>

            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span>Discover → Verify → Personalize → Act → Learn</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">100% Genuine Verified Listings</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      {showResumeModal && (
        <ResumeAnalyzerModal
          onClose={() => setShowResumeModal(false)}
          onSelectOpportunity={(oppId) => {
            const found = opportunities.find(o => o.id === oppId);
            if (found) handleSelectOpportunity(found);
          }}
        />
      )}

      {showHostModal && (
        <HostOpportunityModal
          onClose={() => setShowHostModal(false)}
          onOpportunityCreated={loadOpportunities}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}

    </div>
  );
}
