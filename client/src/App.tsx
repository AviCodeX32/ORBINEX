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
  RotateCcw,
  GraduationCap,
  Trophy,
  Briefcase,
  Users,
  FileText
} from "lucide-react";

import { 
  Opportunity, 
  ApplicationTracker, 
  fetchOpportunities, 
  fetchApplications, 
  addToTracker 
} from "@/lib/api";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { HackathonCarousel } from "@/components/HackathonCarousel";
import { CompanyLogosRow } from "@/components/CompanyLogosRow";
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
  const [userRole, setUserRole] = useState<string>("Talent");

  // Opportunities & Tracker data
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<ApplicationTracker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
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

  // Load Opportunities
  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await fetchOpportunities({
        q: searchQuery || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        mode: selectedMode !== "all" ? selectedMode : undefined,
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
  }, [searchQuery, selectedCategory, selectedMode, isFreeOnly, sortBy]);

  useEffect(() => {
    loadApplications();
  }, []);

  // Card select -> Opens dedicated full page view (like Unstop)
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

  const trackedOpportunityIds = new Set(applications.map(a => a.opportunity_id));

  // Quick categories navigation bar (Unstop screenshot #1)
  const quickCategories = [
    { id: "all", label: "All Opportunities", icon: Compass },
    { id: "hackathon", label: "Hackathons", icon: Trophy },
    { id: "internship", label: "Internships", icon: GraduationCap },
    { id: "scholarship", label: "Scholarships", icon: Award },
    { id: "coding_contest", label: "Coding Contests", icon: Sparkles },
    { id: "mentorship_nav", label: "Mentorship", icon: Users },
    { id: "resume_nav", label: "AI Resume Analyzer", icon: FileText, highlight: true },
  ];

  const handleQuickCategoryClick = (catId: string) => {
    setDedicatedOpp(null);
    if (catId === "mentorship_nav") {
      setActiveTab("mentorship");
    } else if (catId === "resume_nav") {
      setShowResumeModal(true);
    } else {
      setSelectedCategory(catId);
      setActiveTab("home");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* 1. Left Sidebar Navigation (Unstop style) */}
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
            setSelectedCategory("internship");
            setActiveTab("home");
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenHostModal={() => setShowHostModal(true)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        trackedCount={applications.length}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar with Big Search Bar & AI Features */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenResumeAnalyzer={() => setShowResumeModal(true)}
          onOpenAIPrep={() => { setDedicatedOpp(null); setActiveTab("ai_prep"); }}
          onOpenHostModal={() => setShowHostModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          activeTab={activeTab}
          setActiveTab={(tab) => { setDedicatedOpp(null); setActiveTab(tab); }}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* ========================================================= */}
          {/* DEDICATED OPPORTUNITY FULL-PAGE VIEW (Like Unstop)         */}
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
                  
                  {/* Category Quick Navigation Cards (Like Unstop screenshot #1) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {quickCategories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;

                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleQuickCategoryClick(cat.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : cat.highlight
                              ? "bg-gradient-to-tr from-purple-50 to-indigo-50 border-purple-200 text-purple-800 hover:border-purple-400"
                              : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-xs"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-black tracking-tight truncate max-w-[110px]">
                            {cat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Auto-scrollable 3 Latest Hackathons Carousel (Replaces Hero section, slides every 5 sec) */}
                  <HackathonCarousel
                    opportunities={opportunities}
                    onSelect={handleSelectOpportunity}
                  />

                  {/* Mentors & Partners from Top Companies (Google, Amazon, Microsoft, IBM, Flipkart) */}
                  <CompanyLogosRow
                    onExploreMentorship={() => { setDedicatedOpp(null); setActiveTab("mentorship"); }}
                  />

                  {/* Filter & Sorting Controls */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Mode:</span>
                        <select
                          value={selectedMode}
                          onChange={(e) => setSelectedMode(e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="all">All Modes</option>
                          <option value="online">Online / Remote</option>
                          <option value="in-person">In-Person</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>

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

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                      >
                        <option value="recommended">Personalized Match</option>
                        <option value="deadline">Closing Soonest</option>
                        <option value="prize">Highest Prize / Stipend</option>
                        <option value="newest">Recently Discovered</option>
                      </select>
                    </div>
                  </div>

                  {/* Minimal Opportunity Cards Grid */}
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
                        Try adjusting your search query, mode, or category filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setSelectedMode("all");
                          setIsFreeOnly(false);
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Active Verified Opportunities ({opportunities.length})
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          Click any card to view full details & AI prep
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

              {/* ========================================================= */}
              {/* VIEW: MENTORSHIP (Unstop screenshot #2)                    */}
              {/* ========================================================= */}
              {activeTab === "mentorship" && <MentorshipView />}

              {/* ========================================================= */}
              {/* VIEW: REDESIGNED APPLICATION TRACKER                      */}
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
              {/* VIEW: AI PREP ZONE                                        */}
              {/* ========================================================= */}
              {activeTab === "ai_prep" && (
                <AIAssistantView
                  opportunities={opportunities}
                  selectedOppId={opportunities[0]?.id}
                />
              )}

              {/* ========================================================= */}
              {/* VIEW: ADMIN GOVERNANCE & VERIFICATION                     */}
              {/* ========================================================= */}
              {activeTab === "admin" && <AdminView />}

              {/* ========================================================= */}
              {/* VIEW: STUDENT PROFILE & PREFERENCES                       */}
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
