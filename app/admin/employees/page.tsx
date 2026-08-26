"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Phone, Mail, Shield, CheckCircle2, RefreshCw, UserCheck } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("EMPLOYEE");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role }),
      });

      if (res.ok) {
        setName("");
        setEmail("");
        setPhone("");
        await fetchEmployees();
      }
    } catch (err) {
      console.error("Add employee error:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-2">
              <Users className="w-3.5 h-3.5 text-sky-600" /> Employee Directory Management
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Company Employees
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Phase 4: Add team members for automated WhatsApp task cards and email summary dispatching.
            </p>
          </div>

          <button
            onClick={fetchEmployees}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Employee Form Card */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600" />
              <span>Add New Employee</span>
            </h3>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Include country code (e.g. +91 for India)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                >
                  <option value="EMPLOYEE">Employee / Team Member</option>
                  <option value="ADMIN">Company Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{creating ? "Adding..." : "Save Employee"}</span>
              </button>
            </form>
          </div>

          {/* Employee Directory List */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              <span>Registered Team Members ({employees.length})</span>
            </h3>

            {employees.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-sky-50/30 rounded-2xl border border-dashed border-sky-200">
                No employees registered yet. Add team members on the left to enable auto-send dispatching.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-4 rounded-2xl border border-sky-100 bg-slate-50/50 hover:bg-sky-50/30 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm border border-sky-200">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-sky-500" /> {emp.email}
                          </span>
                          {emp.phone && (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-600">
                              <Phone className="w-3 h-3" /> {emp.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        emp.role === "ADMIN"
                          ? "bg-sky-100 text-sky-800 border border-sky-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {emp.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
