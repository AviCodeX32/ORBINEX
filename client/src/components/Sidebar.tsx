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
  Sparkles, 
  User as UserIcon,
  CheckCircle2,
  BookOpen
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHostModal: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  trackedCount: number;
  userRole?: string;
  setUserRole?: (role: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHostModal,
  collapsed,
  setCollapsed,
  trackedCount,
  userRole = "Talent",
  setUserRole,
}) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "internships", label: "Internships", icon: GraduationCap },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "competitions", label: "Competitions", icon: Trophy },
    { id: "scholarships", label: "Scholarships", icon: Award },
    { id: "mentorship", label: "Mentorship", icon: Users, badge: "1-on-1" },
    { id: "tracker", label: "My Activity / Tracker", icon: KanbanSquare, count: trackedCount },
    { id: "admin", label: "Admin & Verify", icon: ShieldCheck },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 z-40 select-none ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Top Area: Logo & Collapse Button */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          {!collapsed && (
            <div 
              onClick={() => setActiveTab("home")} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img src="/logo.svg" alt="ORBINEX" className="w-8 h-8 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  orbinex
                </span>
                <span className="text-[9px] font-bold text-blue-600 tracking-wider uppercase -mt-1">
                  Opportunity Intelligence
                </span>
              </div>
            </div>
          )}

          {collapsed && (
            <div 
              onClick={() => setActiveTab("home")}
              className="mx-auto cursor-pointer"
            >
              <img src="/logo.svg" alt="ORBINEX" className="w-8 h-8 rounded-xl shadow-xs" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* "You're viewing as" Card (Unstop style) */}
        {!collapsed && (
          <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">
              You're viewing as
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="text-xs font-extrabold text-slate-800">{userRole}</span>
              </div>
              <button 
                onClick={() => setUserRole && setUserRole(userRole === "Talent" ? "Organizer" : "Talent")}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Switch
              </button>
            </div>
          </div>
        )}

        {/* "+ Post / Host Hackathon" Button */}
        <div className="p-3">
          <button
            onClick={onOpenHostModal}
            className={`w-full flex items-center justify-center gap-2 font-extrabold text-xs rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all shadow-xs ${
              collapsed ? "py-2.5" : "py-2.5 px-4"
            }`}
            title="Register as an Organizer & List a Hackathon"
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>+ Host Opportunity</span>}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                } ${collapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                
                {/* Badge if present */}
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {item.badge}
                  </span>
                )}

                {/* Counter */}
                {!collapsed && item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Student Profile Strip */}
      <div className="p-3 border-t border-slate-100">
        <div 
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
            AM
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-slate-800 truncate">Avnish Maurya</span>
                <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">75% Profile Completed</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
