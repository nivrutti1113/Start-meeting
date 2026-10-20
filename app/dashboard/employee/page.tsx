"use client";

import { useState, useEffect } from "react";
import { CheckSquare, User, Clock, Target, CheckCircle2, RefreshCw, Sparkles, AlertCircle, Building2 } from "lucide-react";

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
  const [employeeName, setEmployeeName] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [registeredEmployees, setRegisteredEmployees] = useState<any[]>([]);

  // 1. Fetch current user session & registered employees
  useEffect(() => {
    async function initUser() {
      try {
        const [meRes, empRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/employees"),
        ]);
        const meData = await meRes.json();
        const empData = await empRes.json();

        if (empData.employees) {
          setRegisteredEmployees(empData.employees);
        }

        if (meData.authenticated && meData.user) {
          setEmployeeName(meData.user.name);
        } else if (empData.employees && empData.employees.length > 0) {
          setEmployeeName(empData.employees[0].name);
        } else {
          setEmployeeName("Priya Sharma");
        }
      } catch (err) {
        console.error("Employee init error:", err);
      }
    }
    initUser();
  }, []);

  // 2. Fetch tasks for this employee
  const fetchEmployeeTasks = async () => {
    if (!employeeName) return;
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
    if (employeeName) {
      fetchEmployeeTasks();
    }
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30 mb-3">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Individual Contributor Task Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Action Items
            </h1>
            <p className="text-slate-400 text-xs mt-1.5">
              Review and toggle task status for commitments extracted autonomously from meetings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Employee Selector Dropdown */}
            {registeredEmployees.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <select
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none"
                >
                  {registeredEmployees.map((e) => (
                    <option key={e.email} value={e.name} className="bg-slate-900 text-white">
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchEmployeeTasks}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl border border-slate-700/60 shadow-md transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Task Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Assigned</span>
              <span className="text-3xl font-black text-white mt-1 block">{tasks.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
              <span className="text-3xl font-black text-amber-400 mt-1 block">{pendingCount}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 block">{completedCount}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 glass-panel rounded-3xl border border-dashed border-slate-800">
              No tasks assigned to {employeeName} yet.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      task.priority === "High"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                    }`}>
                      {task.priority} Priority
                    </span>
                    {task.deadline && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-sky-400" /> Due: {task.deadline}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-snug">{task.taskDescription}</h3>
                  {task.howTo && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <strong>How to achieve:</strong> {task.howTo}
                    </p>
                  )}
                  {task.goal && (
                    <p className="text-[11px] text-sky-400/80 flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-sky-400" /> Goal: {task.goal}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">Assigned by: {task.assignedBy}</p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleToggleTaskStatus(task.id, task.status)}
                    disabled={updatingId === task.id}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                      task.status === "DONE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${task.status === "DONE" ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{task.status === "DONE" ? "Completed" : "Mark as Done"}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
