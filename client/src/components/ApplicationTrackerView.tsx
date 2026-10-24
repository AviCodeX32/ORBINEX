import React, { useState } from "react";
import { 
  KanbanSquare, 
  ListFilter, 
  Plus, 
  CheckSquare, 
  Square, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  Award
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
  onOpenDetails: (opp: any) => void;
  onOpenAIPrep: (opp: any) => void;
}

const STAGES = [
  { id: "SAVED", label: "Saved", color: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-400" },
  { id: "APPLIED", label: "Applied", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  { id: "UNDER_REVIEW", label: "Under Review", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  { id: "INTERVIEW_ROUND", label: "Interview / Round 2", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  { id: "ACCEPTED", label: "Accepted / Won", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { id: "REJECTED", label: "Closed", color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-400" },
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onRefresh,
  onOpenDetails,
  onOpenAIPrep,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [newTaskTitles, setNewTaskTitles] = useState<Record<number, string>>({});
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  const toggleExpand = (appId: number) => {
    setExpandedCards(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      setLoadingAction(appId);
      await updateApplication(appId, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (appId: number) => {
    if (!confirm("Are you sure you want to remove this opportunity from your tracker?")) return;
    try {
      setLoadingAction(appId);
      await deleteApplication(appId);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete application", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleApplicationTask(taskId);
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const handleAddTask = async (appId: number, e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitles[appId]?.trim();
    if (!title) return;
    try {
      await addApplicationTask(appId, { title, priority: "medium" });
      setNewTaskTitles(prev => ({ ...prev, [appId]: "" }));
      onRefresh();
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-blue-600" />
            <span>Opportunity Application Pipeline</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {applications.length} Tracked
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your deadlines, prep tasks, submission links, and interview progress.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === "kanban"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <KanbanSquare className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Detailed List</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {applications.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200">
            <KanbanSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your application tracker is empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Discover verified hackathons, internships, scholarships, and fellowships, then click "Track" to organize your preparation and deadlines here.
          </p>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && applications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STAGES.map(stage => {
            const stageApps = applications.filter(a => a.status === stage.id);

            return (
              <div 
                key={stage.id} 
                className="bg-slate-100/70 rounded-xl border border-slate-200/90 p-3 flex flex-col min-h-[450px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                    <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {stageApps.length}
                  </span>
                </div>

                {/* Applications list in stage */}
                <div className="space-y-3 flex-1">
                  {stageApps.map(app => {
                    const isExpanded = !!expandedCards[app.id];
                    const completedTasks = app.tasks.filter(t => t.is_completed).length;

                    return (
                      <div 
                        key={app.id}
                        className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-3 text-xs flex flex-col justify-between"
                      >
                        {/* Card Header: Category & Move status */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {app.opportunity?.category || "Opportunity"}
                          </span>

                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={loadingAction === app.id}
                            className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Title */}
                        <h4 
                          onClick={() => app.opportunity && onOpenDetails(app.opportunity)}
                          className="font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer leading-snug mb-1"
                        >
                          {app.opportunity?.title || "Tracked Opportunity"}
                        </h4>

                        <p className="text-[11px] text-slate-500 font-medium truncate mb-2">
                          {app.opportunity?.organizer}
                        </p>

                        {/* Prize & Deadline tags */}
                        <div className="space-y-1 mb-2.5 pt-2 border-t border-slate-100 text-[11px]">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                              <Award className="w-3 h-3 text-amber-500" />
                              Prizes
                            </span>
                            <span className="font-bold text-slate-800 truncate max-w-[110px]">
                              {app.opportunity?.prize_description}
                            </span>
                          </div>

                          {app.deadline && (
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                                <Clock className="w-3 h-3 text-blue-500" />
                                Deadline
                              </span>
                              <span className="font-semibold text-slate-700">
                                {new Date(app.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Notes preview if present */}
                        {app.notes && (
                          <div className="p-2 rounded bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 mb-2.5 line-clamp-2">
                            <span className="font-bold">Note:</span> {app.notes}
                          </div>
                        )}

                        {/* Tasks Summary & Expand Toggle */}
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            onClick={() => toggleExpand(app.id)}
                            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-blue-600 py-0.5"
                          >
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                              <span>Checklist ({completedTasks}/{app.tasks.length})</span>
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {/* Expanded Task Checklist */}
                          {isExpanded && (
                            <div className="mt-2 space-y-2 pt-2 border-t border-slate-100 animate-in fade-in">
                              <div className="space-y-1.5">
                                {app.tasks.map(task => (
                                  <div
                                    key={task.id}
                                    onClick={() => handleToggleTask(task.id)}
                                    className="flex items-start gap-1.5 cursor-pointer text-[11px] group p-1 rounded hover:bg-slate-50"
                                  >
                                    {task.is_completed ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 mt-0.5" />
                                    )}
                                    <span className={`flex-1 leading-tight ${
                                      task.is_completed ? "line-through text-slate-400" : "text-slate-700"
                                    }`}>
                                      {task.title}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Add Quick Task Input */}
                              <form onSubmit={(e) => handleAddTask(app.id, e)} className="flex items-center gap-1 mt-1">
                                <input
                                  type="text"
                                  placeholder="Add checklist item..."
                                  value={newTaskTitles[app.id] || ""}
                                  onChange={(e) => setNewTaskTitles(prev => ({ ...prev, [app.id]: e.target.value }))}
                                  className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                                />
                                <button
                                  type="submit"
                                  className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </form>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => app.opportunity && onOpenAIPrep(app.opportunity)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Prep</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {app.opportunity?.direct_registration_url && (
                              <a
                                href={app.opportunity.direct_registration_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                                title="Open Official Portal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                              title="Delete from tracker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-[11px] border-2 border-dashed border-slate-200 rounded-xl">
                      No applications in this stage
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED LIST / TABLE VIEW */}
      {viewMode === "table" && applications.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Prizes</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Checklist Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map(app => {
                  const completedTasks = app.tasks.filter(t => t.is_completed).length;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span 
                          onClick={() => app.opportunity && onOpenDetails(app.opportunity)}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        >
                          {app.opportunity?.title}
                        </span>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                          {app.opportunity?.category} • {app.opportunity?.mode}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-600">
                        {app.opportunity?.organizer}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-slate-800 outline-none"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-800">
                        {app.opportunity?.prize_description}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {app.deadline ? new Date(app.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{ width: `${app.tasks.length ? (completedTasks / app.tasks.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {completedTasks}/{app.tasks.length}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => app.opportunity && onOpenAIPrep(app.opportunity)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 transition-colors"
                            title="AI Preparation Playbook"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                          {app.opportunity?.direct_registration_url && (
                            <a
                              href={app.opportunity.direct_registration_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 transition-colors"
                              title="Open Portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-400 text-slate-600 hover:text-rose-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

