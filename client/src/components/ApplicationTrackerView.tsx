import React, { useState } from "react";
import { 
  KanbanSquare, 
  Plus, 
  CheckSquare, 
  Square, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Award,
  ChevronDown,
  ChevronUp,
  LogIn,
  Filter,
  Check
} from "lucide-react";
import { 
  ApplicationTracker, 
  updateApplication, 
  deleteApplication, 
  addApplicationTask, 
  toggleApplicationTask 
} from "@/lib/api";

interface ApplicationTrackerViewProps {
  applications: ApplicationTracker[];
  onRefresh: () => void;
  onSelectOpportunity: (opp: any) => void;
  onOpenAIPrep: (opp: any) => void;
  currentUser?: any;
  onOpenAuthModal?: () => void;
}

const STAGES = [
  { id: "ALL", label: "All Applications" },
  { id: "SAVED", label: "Saved" },
  { id: "APPLIED", label: "Applied" },
  { id: "UNDER_REVIEW", label: "Under Review" },
  { id: "INTERVIEW_ROUND", label: "Interview / Round 2" },
  { id: "ACCEPTED", label: "Accepted / Won" },
  { id: "REJECTED", label: "Closed" },
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onRefresh,
  onSelectOpportunity,
  onOpenAIPrep,
  currentUser,
  onOpenAuthModal,
}) => {
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [newTaskTitle, setNewTaskTitle] = useState<Record<number, string>>({});

  // If user is NOT authenticated, display clean Auth Guard card
  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <KanbanSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">
            Sign In to Access Your Application Pipeline
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Manage your opportunities, track deadlines, track interview rounds, organize milestone checklists, and sync your applications in real-time.
          </p>
        </div>
        <button
          onClick={() => onOpenAuthModal && onOpenAuthModal()}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In / Create Account</span>
        </button>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = async (appId: number, status: string) => {
    try {
      await updateApplication(appId, { status });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (appId: number) => {
    if (!confirm("Remove this opportunity from your application tracker?")) return;
    try {
      await deleteApplication(appId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleApplicationTask(taskId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (appId: number, e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle[appId]?.trim();
    if (!title) return;
    try {
      await addApplicationTask(appId, { title });
      setNewTaskTitle(prev => ({ ...prev, [appId]: "" }));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = selectedStage === "ALL"
    ? applications
    : applications.filter(a => a.status === selectedStage);

  // Stats calculation
  const totalCount = applications.length;
  const inReviewCount = applications.filter(a => a.status === "UNDER_REVIEW" || a.status === "INTERVIEW_ROUND").length;
  const appliedCount = applications.filter(a => a.status === "APPLIED").length;
  const acceptedCount = applications.filter(a => a.status === "ACCEPTED").length;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header & Stats Strip (Unstop style clean cards) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-blue-600" />
            <span>My Application Pipeline & Milestones</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track registration deadlines, round submissions, interview preparations, and outcome tasks.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tracked</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Applied</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{appliedCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">In Review / Rounds</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{inReviewCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Finalist / Offers</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{acceptedCount}</p>
          </div>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STAGES.map(s => {
          const count = s.id === "ALL" ? applications.length : applications.filter(a => a.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStage(s.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
                selectedStage === s.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{s.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                selectedStage === s.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <KanbanSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No applications in this stage</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Explore verified opportunities on the home page and click "Track Application" to organize them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(app => {
            const isExpanded = !!expandedCards[app.id];
            const completedTasks = app.tasks ? app.tasks.filter(t => t.is_completed).length : 0;
            const totalTasks = app.tasks ? app.tasks.length : 0;
            const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-400 transition-all space-y-4"
              >
                {/* Top Row: Category, Title, Stage Dropdown, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                        {app.opportunity?.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {app.opportunity?.organizer}
                      </span>
                    </div>

                    <h4 
                      onClick={() => app.opportunity && onSelectOpportunity(app.opportunity)}
                      className="text-base font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {app.opportunity?.title}
                    </h4>
                  </div>

                  {/* Stage Dropdown & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="text-xs font-extrabold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 outline-none focus:border-slate-800 cursor-pointer"
                    >
                      {STAGES.filter(s => s.id !== "ALL").map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>

                    {app.opportunity?.direct_registration_url && (
                      <a
                        href={app.opportunity.direct_registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Open Official Registration Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar & Task expander */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Milestones Progress ({completedTasks}/{totalTasks} Completed)</span>
                    </span>
                    <button
                      onClick={() => toggleExpand(app.id)}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Tasks" : "View Checklist"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-slate-900 h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Expanded Checklist */}
                  {isExpanded && (
                    <div className="space-y-2.5 pt-2 border-t border-slate-200 animate-in fade-in text-xs">
                      <div className="space-y-1.5">
                        {app.tasks && app.tasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(task.id)}
                            className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer group"
                          >
                            {task.is_completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-800 shrink-0 mt-0.5" />
                            )}
                            <span className={task.is_completed ? "line-through text-slate-400" : "text-slate-800 font-medium"}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add quick task */}
                      <form onSubmit={(e) => handleAddTask(app.id, e)} className="flex items-center gap-1 pt-1">
                        <input
                          type="text"
                          placeholder="Add new preparation task (e.g. submit deck, prepare round 1)..."
                          value={newTaskTitle[app.id] || ""}
                          onChange={(e) => setNewTaskTitle(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="flex-1 p-2 px-3 text-xs border border-slate-300 rounded-lg outline-none bg-white focus:border-slate-800"
                        />
                        <button
                          type="submit"
                          className="p-2 px-3.5 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 cursor-pointer"
                        >
                          Add Task
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
