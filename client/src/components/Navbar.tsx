import React, { useState } from "react";
import { 
  Search, 
  Sparkles, 
  FileText, 
  Bell, 
  Building2, 
  User as UserIcon, 
  CheckCircle2, 
  LogOut, 
  LogIn,
  ChevronDown,
  X,
  Check,
  Calendar,
  Briefcase,
  Trophy,
  Zap
} from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  category: "hackathon" | "job" | "tracker" | "system";
}

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenResumeAnalyzer: () => void;
  onOpenAIPrep: () => void;
  onOpenHostModal: () => void;
  onOpenAuthModal: () => void;
  onSignOut?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenResumeAnalyzer,
  onOpenAIPrep,
  onOpenHostModal,
  onOpenAuthModal,
  onSignOut,
  activeTab,
  setActiveTab,
  currentUser,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Live Interactive Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: "Smart India Hackathon 2026",
      message: "Registration deadline is approaching in 18 days. Submit your college SPOC nomination.",
      time: "2h ago",
      unread: true,
      category: "hackathon"
    },
    {
      id: 2,
      title: "Google Graduate SDE 2026",
      message: "New verified full-time engineering opening discovered on Google Careers (₹25–38 LPA).",
      time: "5h ago",
      unread: true,
      category: "job"
    },
    {
      id: 3,
      title: "ETHIndia 2026 Milestone",
      message: "Your application is in Round 2 Hacker Review on Devfolio.",
      time: "1d ago",
      unread: true,
      category: "tracker"
    },
    {
      id: 4,
      title: "AI Opportunity Intelligence",
      message: "Background discovery agent completed refresh and verified 4 new opportunities.",
      time: "1d ago",
      unread: false,
      category: "system"
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const removeNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "";
  const userEmail = currentUser?.email || "";
  const userInitials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const getNotificationIcon = (cat: string) => {
    switch (cat) {
      case "hackathon":
        return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
      case "job":
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case "tracker":
        return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left/Center: Search Bar */}
          <div className="flex-1 max-w-xl lg:max-w-2xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Skill, Hackathon, Internship, Scholarship or Company..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-transparent focus:border-blue-500 rounded-full outline-none transition-all placeholder:text-slate-400 shadow-2xs font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* AI Features (In Top Navbar) */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* AI Resume Analyzer Pill */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal();
                } else {
                  onOpenResumeAnalyzer();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100 transition-all shadow-2xs cursor-pointer"
              title="Analyze resume against target role with AI"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Resume Analyzer</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* AI Prep Zone */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal();
                } else {
                  onOpenAIPrep();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                activeTab === "ai_prep"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Prep Zone</span>
            </button>
          </div>

          {/* Right Area: For Business, Notifications & Profile / Sign In */}
          <div className="flex items-center gap-2">
            
            {/* For Business & Colleges Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal();
                } else {
                  onOpenHostModal();
                }
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>For Business & Colleges</span>
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 text-xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-xs">No notifications right now</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                            setNotificationsOpen(false);
                            if (n.category === "tracker") {
                              if (!currentUser) onOpenAuthModal();
                              else setActiveTab("tracker");
                            } else if (n.category === "hackathon") {
                              setSearchQuery("Smart India Hackathon");
                              setActiveTab("home");
                            } else if (n.category === "job") {
                              setActiveTab("jobs");
                            } else if (n.category === "system") {
                              if (!currentUser) onOpenAuthModal();
                              else setActiveTab("admin");
                            }
                          }}
                          className={`py-3 px-2 flex items-start gap-3 rounded-xl transition-colors cursor-pointer ${
                            n.unread ? "bg-slate-50/80 font-medium" : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                            {getNotificationIcon(n.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                              <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                              {n.message}
                            </p>
                          </div>
                          <button
                            onClick={(e) => removeNotification(n.id, e)}
                            className="text-slate-300 hover:text-slate-600 p-1 shrink-0"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Real-time Opportunity & Tracker Alerts
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar (If signed in) OR Sign In Button (If NOT signed in) */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="relative w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center border-2 border-emerald-500 shadow-xs">
                    {userInitials}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Card Dropdown */}
                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 text-xs"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center border-2 border-emerald-500 shrink-0">
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {displayName || "Student Builder"}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    {/* Quick Metric Badges */}
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
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>Edit Profile</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">85%</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab("tracker"); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>My Applications & Tracker</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab("admin"); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>Admin Verification Console</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onSignOut) onSignOut();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 pt-2 border-t border-slate-100 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If NOT signed in: Show prominent Sign In button */
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
