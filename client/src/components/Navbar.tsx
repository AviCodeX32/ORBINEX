import React, { useState } from "react";
import { 
  Search, 
  Sparkles, 
  FileText, 
  BookOpen, 
  Bell, 
  Building2, 
  User as UserIcon, 
  CheckCircle2, 
  LogOut, 
  Settings, 
  Award,
  ChevronDown,
  Layers
} from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenResumeAnalyzer: () => void;
  onOpenAIPrep: () => void;
  onOpenHostModal: () => void;
  onOpenAuthModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenResumeAnalyzer,
  onOpenAIPrep,
  onOpenHostModal,
  onOpenAuthModal,
  activeTab,
  setActiveTab,
  isLoggedIn = true,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Center / Left: Bigger Search Bar (Like Unstop) */}
          <div className="flex-1 max-w-xl lg:max-w-2xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Skill, Industry, Hackathon, Internship or Company..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-blue-500 rounded-full outline-none transition-all placeholder:text-slate-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* AI Features (In Top Navbar as requested) */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* AI Resume Analyzer Pill */}
            <button
              onClick={onOpenResumeAnalyzer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100 transition-all shadow-2xs"
              title="Analyze resume against target role with AI"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Resume Analyzer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* AI Prep Zone */}
            <button
              onClick={onOpenAIPrep}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeTab === "ai_prep"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Prep Zone</span>
            </button>
          </div>

          {/* Right Area: For Business, Notification, Profile Dropdown */}
          <div className="flex items-center gap-2">
            
            {/* For Business & Colleges Button (Unstop style) */}
            <button
              onClick={onOpenHostModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>For Business & Colleges</span>
            </button>

            {/* Notification Bell */}
            <button 
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2" />
            </button>

            {/* Profile Avatar & Dropdown (Like Unstop screenshot #1) */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-black text-xs flex items-center justify-center border-2 border-emerald-500 shadow-xs">
                  AM
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Unstop-style Profile Card Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-black text-sm flex items-center justify-center border-2 border-emerald-500 shrink-0">
                      AM
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-sm text-slate-900 truncate">Avnish Maurya</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">avnishmaurya4664@gmail.com</p>
                    </div>
                  </div>

                  {/* Badges / Rating */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2 bg-slate-50 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">TALENT POINTS</span>
                      <span className="font-extrabold text-slate-800">⭐ 620 pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">NATIONAL RANK</span>
                      <span className="font-extrabold text-emerald-600">🏆 #412</span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="space-y-1 text-xs text-slate-700 font-medium pt-1">
                    <button
                      onClick={() => { setActiveTab("profile"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <span>Edit Profile</span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">75%</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab("tracker"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <span>My Applications & Activity</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab("admin"); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                    >
                      <span>Admin Verification Console</span>
                    </button>
                    <button
                      onClick={() => { onOpenAuthModal(); setProfileDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 pt-2 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign In with Supabase / Google</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
