import React from "react";
import { 
  Home, 
  GraduationCap, 
  Briefcase, 
  Trophy, 
  Award, 
  Users, 
  KanbanSquare, 
  ShieldCheck, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  LogIn
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHostModal: () => void;
  onOpenAuthModal?: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  trackedCount: number;
  currentUser?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHostModal,
  onOpenAuthModal,
  collapsed,
  setCollapsed,
  trackedCount,
  currentUser,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "internships", label: "Internships", icon: GraduationCap },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "competitions", label: "Competitions", icon: Trophy },
    { id: "scholarships", label: "Scholarships", icon: Award },
    { id: "mentorship", label: "Mentorship", icon: Users },
    { id: "tracker", label: "Application Tracker", icon: KanbanSquare, count: trackedCount },
    { id: "admin", label: "Admin Console", icon: ShieldCheck },
  ];

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "Avnish Maurya";
  const userInitials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className={`sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 z-40 select-none shrink-0 ${
        collapsed ? "w-18" : "w-60"
      }`}
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          {!collapsed ? (
            <div 
              onClick={() => setActiveTab("home")} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img src="/logo.svg" alt="ORBINEX" className="w-8 h-8 rounded-xl" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  orbinex
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-1">
                  Opportunity Hub
                </span>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setActiveTab("home")}
              className="mx-auto cursor-pointer"
            >
              <img src="/logo.svg" alt="ORBINEX" className="w-8 h-8 rounded-xl" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* "+ Host Opportunity" Button */}
        <div className="p-3">
          <button
            onClick={onOpenHostModal}
            className={`w-full flex items-center justify-center gap-2 font-bold text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer ${
              collapsed ? "py-2.5" : "py-2.5 px-3"
            }`}
            title="Host / List an Opportunity"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>Host Opportunity</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                } ${collapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                
                {/* Count badge */}
                {!collapsed && item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Summary Strip */}
      <div className="p-3 border-t border-slate-100">
        <div 
          onClick={() => {
            if (currentUser) {
              setActiveTab("profile");
            } else if (onOpenAuthModal) {
              onOpenAuthModal();
            } else {
              setActiveTab("profile");
            }
          }}
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={currentUser ? "View Profile" : "Sign In to ORBINEX"}
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
            {userInitials || "AM"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {displayName}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email || "IIT Delhi • Student"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
