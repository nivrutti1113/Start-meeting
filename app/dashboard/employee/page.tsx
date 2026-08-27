"use client";

import { useState, useEffect } from "react";
import { CheckSquare, User, Clock, Target, CheckCircle2, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

interface TaskItem {
  id: string;
  assignedBy: string;
  assignedTo: string;
  taskDescription: string;
  howTo: string | null;
  goal: string | null;
  deadline: string | null;
  priority: string;
  status: string;
}

export default function EmployeePortalDashboard() {
  const [employeeName, setEmployeeName] = useState("Priya");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEmployeeTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (data.meetings) {
        const allTasks: TaskItem[] = data.meetings.flatMap((m: any) => m.tasks || []);
        const filtered = allTasks.filter(
          (t) =>
            t.assignedTo.toLowerCase().includes(employeeName.toLowerCase()) ||
            employeeName.toLowerCase().includes(t.assignedTo.toLowerCase())
        );
        setTasks(filtered.length > 0 ? filtered : allTasks);
      }
    } catch (err) {
      console.error("Failed to fetch employee tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeTasks();
  }, [employeeName]);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    setUpdatingId(taskId);
    const newStatus = currentStatus === "DONE" ? "PENDING" : "DONE";
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchEmployeeTasks();
      }
    } catch (err) {
      console.error("Toggle task error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = tasks.filter((t) => t.status !== "DONE").length;
  const completedCount = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/30 mb-2">
              <User className="w-3.5 h-3.5 text-sky-400" /> Employee Personal Workspace
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Assigned Deliverables
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              View your assigned meeting action items, deadlines, instructions, and update task progress.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 pl-2">Member:</span>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              placeholder="Your name..."
            />
          </div>
        </div>

        {/* Task Cards List */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sky-400" />
                <span>Action Items ({tasks.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingCount} Pending | {completedCount} Completed
              </p>
            </div>

            <button
              onClick={fetchEmployeeTasks}
              className="p-2.5 bg-slate-800 text-sky-400 hover:bg-slate-700 rounded-xl border border-slate-700/60 transition-all"
              title="Refresh Deliverables"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              No assigned tasks found for member "{employeeName}".
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((t) => {
                const isDone = t.status === "DONE";
                let priorityBadge = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                if (t.priority === "High") priorityBadge = "bg-red-500/10 text-red-400 border-red-500/30";
                if (t.priority === "Low") priorityBadge = "bg-slate-800 text-slate-400 border-slate-700";

                return (
                  <div
                    key={t.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityBadge}`}>
                            {t.priority} Priority
                          </span>
                          <span className="text-xs text-slate-400">Assigned by <strong className="text-white">{t.assignedBy}</strong></span>
                        </div>
                        <h4 className={`font-bold text-base ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                          {t.taskDescription}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleToggleTaskStatus(t.id, t.status)}
                        disabled={updatingId === t.id}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                          isDone
                            ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                            : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isDone ? "Mark Pending" : "Mark as DONE"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-slate-300">
                      {t.howTo && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-sky-400 font-bold block mb-1">Implementation Notes:</span>
                          {t.howTo}
                        </div>
                      )}
                      {t.goal && (
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-emerald-400 font-bold block mb-1">Target Goal:</span>
                          {t.goal}
                        </div>
                      )}
                    </div>

                    {t.deadline && (
                      <div className="mt-3 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        Deadline Target: {t.deadline}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

