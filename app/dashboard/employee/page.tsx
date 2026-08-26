"use client";

import { useState, useEffect } from "react";
import { CheckSquare, User, Clock, Target, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";

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
        // Filter tasks matching employee name
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-2">
              <User className="w-3.5 h-3.5 text-sky-600" /> Employee Personal Workspace
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Assigned Tasks
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Phase 5: Direct employee portal to view your meeting tasks & update status (Pending → Done).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Employee:</label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Your name..."
            />
          </div>
        </div>

        {/* Task Cards List */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sky-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-sky-600" />
              <span>Tasks Assigned to "{employeeName}" ({tasks.length})</span>
            </h3>

            <button
              onClick={fetchEmployeeTasks}
              className="p-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl transition-colors"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-sky-50/30 rounded-2xl border border-sky-200">
              No tasks assigned to {employeeName} yet.
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((t) => {
                const isDone = t.status === "DONE";
                return (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-slate-50/50 border-sky-100 hover:border-sky-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                      <div>
                        <span className="text-xs text-slate-500">Assigned by <strong className="text-slate-800">{t.assignedBy}</strong></span>
                        <h4 className={`font-bold text-base mt-0.5 ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {t.taskDescription}
                        </h4>
                      </div>

                      <button
                        onClick={() => handleToggleTaskStatus(t.id, t.status)}
                        disabled={updatingId === t.id}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                          isDone
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200"
                            : "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-200"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isDone ? "Mark Pending" : "Mark as DONE"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                      {t.howTo && <div className="bg-white p-2.5 rounded-xl border border-slate-200"><strong>How to build:</strong> {t.howTo}</div>}
                      {t.goal && <div className="bg-white p-2.5 rounded-xl border border-slate-200"><strong>Goal:</strong> {t.goal}</div>}
                    </div>

                    {t.deadline && (
                      <div className="mt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        Deadline: {t.deadline}
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
