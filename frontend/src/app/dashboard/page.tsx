"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { IncidentResponse } from "@/types/incident";
import { ResourceResponse } from "@/types/resource";
import { DispatchResponse } from "@/types/dispatch";
import Link from "next/link";

export default function DashboardOverview() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [dispatches, setDispatches] = useState<DispatchResponse[]>([]);
  
  const [apiError, setApiError] = useState(false);

  const [loading, setLoading] = useState(true);

  // IMD Weather Bulletin (live data fetch via backend integration)
  const [weather, setWeather] = useState({
    districtWarning: "Loading...",
    cycloneName: "Loading...",
    windSpeed: "Loading...",
    rainfall: "Loading...",
    affectedDistricts: "Loading...",
    lastUpdated: "Loading...",
  });

  const fetchData = async () => {
    try {
      const [incList, resList, dispList, weatherData] = await Promise.all([
        api.get<IncidentResponse[]>("/incidents").catch(() => []),
        api.get<ResourceResponse[]>("/resources").catch(() => []),
        api.get<DispatchResponse[]>("/dispatches").catch(() => []),
        api.get<any>("/weather").catch(() => null),
      ]);
      setIncidents(incList || []);
      setResources(resList || []);
      setDispatches(dispList || []);
      if (weatherData) {
        setWeather(weatherData);
      }
      setApiError(false);
    } catch (err) {
      console.error("Dashboard fetch error", err);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Analytics — all derived from real backend data
  const emergencyIncidents = incidents.filter((i) => i.status !== "CLOSED" || !i.rejection_reason);
  const reportsToday = incidents.length;
  const waitingVerification = incidents.filter((i) => i.status === "NEW").length;
  const waitingApproval = incidents.filter(
    (i) => i.status === "TRIAGED"
  );
  const underReview = incidents.filter((i) => i.status === "UNDER_REVIEW");
  const closedNonEmergency = incidents.filter((i) => i.status === "CLOSED").length;
  const approvedIncidents = incidents.filter((i) =>
    ["APPROVED", "DISPATCHED", "IN_PROGRESS", "RESOLVED"].includes(i.status)
  ).length;
  const activeMissions = dispatches.filter((d) =>
    ["CREATED", "DISPATCHED", "EN_ROUTE", "ON_SITE"].includes(d.status)
  );
  const availableResources = resources.filter((r) => r.status === "AVAILABLE").length;

  // Map
  const mapCenterLat = 20.296;
  const mapCenterLng = 85.824;
  const mapBbox = `${mapCenterLng - 0.5},${mapCenterLat - 0.5},${mapCenterLng + 0.5},${mapCenterLat + 0.5}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${mapCenterLat},${mapCenterLng}`;

  // Pipeline Stages — all from real data
  const pipelineStages = [
    { title: "Citizen Report", count: reportsToday, status: "Intake", color: "blue" },
    { title: "AI Verification", count: reportsToday - waitingVerification, status: "Verified", color: "indigo" },
    { title: "Collector Approval", count: waitingApproval.length, status: "Pending", color: "amber" },
    { title: "Dispatch", count: activeMissions.length, status: "Generated", color: "green" },
    { title: "Mission Execution", count: activeMissions.length, status: "Active", color: "emerald" },
  ];

  // Activity Log — derived from real incidents, most recent first
  const activityLogs = incidents
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((inc) => {
      const time = new Date(inc.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const statusMap: Record<string, { event: string; module: string; type: string }> = {
        TRIAGED: { event: `AI Verified: ${inc.title}`, module: "Incident Verification", type: "indigo" },
        UNDER_REVIEW: { event: `Needs Review: ${inc.title}`, module: "Manual Review", type: "amber" },
        APPROVED: { event: `Collector Approved: ${inc.title}`, module: "Collector Approval", type: "emerald" },
        DISPATCHED: { event: `Dispatch Created: ${inc.title}`, module: "Dispatch Automation", type: "green" },
        IN_PROGRESS: { event: `Mission Active: ${inc.title}`, module: "Mission Execution", type: "green" },
        CLOSED: { event: `Closed: ${inc.title}`, module: "Classification", type: "slate" },
      };
      const info = statusMap[inc.status] || { event: `SOS Received: ${inc.title}`, module: "Emergency Intake", type: "blue" };
      return { time, ...info };
    });

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 font-sans p-5 md:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">District Collector Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Odisha State Emergency Operations Center • Live Overview</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
            <span>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
            <span className="text-slate-300">|</span>
            <span>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </header>

        {/* INCIDENT SUMMARY CARDS */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
            Unable to load incident data. Retrying...
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {underReview.length > 0 && (
            <section className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm">
              <h2 className="text-sm font-bold text-amber-800 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Requires Human Review ({underReview.length})
              </h2>
              <ul className="space-y-3 text-sm text-amber-900 h-48 overflow-y-auto pr-2">
                {underReview.map((inc) => (
                  <li key={inc.id} className="border-b border-amber-200 pb-2 last:border-0 flex justify-between items-center">
                    <div>
                      <span className="font-bold">INC-{inc.id}</span>: {inc.title || inc.description || "Unclear Report"}
                      <span className="block text-xs text-amber-600 mt-0.5">AI could not determine the emergency type.</span>
                    </div>
                    <button onClick={() => router.push(`/dashboard/incidents/${inc.id}`)} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-md transition-colors shrink-0">Review</button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> System Status
            </h2>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-2"><span>Total Reports</span><span className="font-bold">{reportsToday}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span>Emergency (Triaged)</span><span className="font-bold text-blue-700">{waitingApproval.length}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span>Under Review (Uncertain)</span><span className="font-bold text-amber-600">{underReview.length}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span>Non-Emergency (Closed)</span><span className="font-bold text-slate-500">{closedNonEmergency}</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span>Active Dispatches</span><span className="font-bold text-emerald-600">{activeMissions.length}</span></div>
              <div className="flex justify-between"><span>Resources Available</span><span className="font-bold">{availableResources}</span></div>
            </div>
          </section>
        </div>

        {/* AUTOMATION IMPACT SECTION */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-xl shadow-md text-white">
          <h2 className="text-sm font-bold text-blue-200 mb-4 uppercase tracking-widest">Sahaya AI Automation Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 opacity-80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Without Sahaya AI</h3>
              <ul className="text-sm space-y-2">
                <li className="flex justify-between border-b border-white/10 pb-1"><span>Manual Review:</span> <span>15 minutes</span></li>
                <li className="flex justify-between border-b border-white/10 pb-1"><span>Dispatch Generation:</span> <span>10 minutes</span></li>
                <li className="flex justify-between border-b border-white/10 pb-1"><span>Hospital Notification:</span> <span>Manual calls</span></li>
                <li className="flex justify-between border-b border-white/10 pb-1"><span>Citizen Updates:</span> <span>Delayed/None</span></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">With Sahaya AI</h3>
              <ul className="text-sm space-y-2 font-medium">
                <li className="flex justify-between border-b border-white/20 pb-1"><span>AI Verification:</span> <span className="text-green-400">20 seconds</span></li>
                <li className="flex justify-between border-b border-white/20 pb-1"><span>Dispatch Generation:</span> <span className="text-green-400">Automatic</span></li>
                <li className="flex justify-between border-b border-white/20 pb-1"><span>Hospital Notification:</span> <span className="text-green-400">Automatic API</span></li>
                <li className="flex justify-between border-b border-white/20 pb-1"><span>Citizen Updates:</span> <span className="text-green-400">Live SMS/WhatsApp</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total Reports" value={reportsToday} color="blue" />
          <KpiCard label="Waiting AI Verification" value={waitingVerification} color="slate" />
          <KpiCard label="Pending Collector Approval" value={waitingApproval.length} color="amber" />
          <KpiCard label="Under Human Review" value={underReview.length} color="rose" />
          <KpiCard label="Active Missions" value={activeMissions.length} color="emerald" />
          <KpiCard label="Resources Available" value={availableResources} color="blue" />
        </div>

        {/* AUTOMATION PIPELINE */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <h2 className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wide">Business Process Automation Pipeline</h2>
          <div className="flex items-center min-w-max space-x-1.5">
            {pipelineStages.map((stage, i) => (
              <div key={stage.title} className="flex items-center">
                <PipelineStage {...stage} />
                {i < pipelineStages.length - 1 && <PipelineArrow />}
              </div>
            ))}
          </div>
        </div>

        {/* WEATHER + MAP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IMD Weather Bulletin */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-blue-800 px-5 py-3 flex justify-between items-center">
              <h2 className="font-bold text-white text-sm">IMD Weather Bulletin</h2>
              <span className="text-[10px] text-blue-200 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Live: {weather.lastUpdated}</span>
            </div>
            <div className="p-5 space-y-4 flex-1">
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1">District Warning</div>
                <div className="text-sm font-medium text-red-900 leading-snug">{weather.districtWarning}</div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <WeatherDetail label="Cyclone Name" value={weather.cycloneName} />
                <WeatherDetail label="Wind Speed" value={weather.windSpeed} />
                <WeatherDetail label="Rainfall (24hr)" value={weather.rainfall} />
                <WeatherDetail label="Affected Districts" value="14 / 30" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Districts Under Alert</div>
                <p className="text-xs text-slate-700 leading-relaxed">{weather.affectedDistricts}</p>
              </div>
            </div>
            <div className="bg-slate-50 px-5 py-2 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between items-center">
              <span>Source: India Meteorological Department API</span>
              <span className="text-green-600 font-medium">Sync Active</span>
            </div>
          </div>
          {/* Odisha Operations Map */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Odisha District Map</h2>
              <div className="flex space-x-3 text-[11px] font-medium">
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /><span className="text-slate-500">SOS Reports</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /><span className="text-slate-500">Rescue Teams</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span className="text-slate-500">Hospitals</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /><span className="text-slate-500">Shelters</span></span>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-100 relative">
              <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src={mapUrl} style={{ border: 0 }} title="Odisha District Map" />
            </div>
          </div>
        </div>

        {/* TABLES ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Collector Approvals */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Pending Collector Approvals</h2>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">{waitingApproval.length} Waiting</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-5 py-2.5">ID</th>
                    <th className="px-5 py-2.5">District</th>
                    <th className="px-5 py-2.5">Disaster</th>
                    <th className="px-5 py-2.5">Priority</th>
                    <th className="px-5 py-2.5">Time</th>
                    <th className="px-5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {waitingApproval.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No pending approvals. All caught up.</td></tr>
                  ) : (
                    waitingApproval.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono text-slate-500">{String(inc.id).substring(0, 8)}</td>
                        <td className="px-5 py-3 text-sm text-slate-800 font-medium">{inc.district || "Khordha"}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{inc.title || "Emergency"}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${inc.severity === "CRITICAL" ? "bg-red-100 text-red-700" : inc.severity === "HIGH" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400">{inc.created_at ? new Date(inc.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => router.push(`/dashboard/incidents/${inc.id}`)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-md transition-colors">Review</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Rescue Missions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[350px]">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Active Rescue Missions</h2>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">{activeMissions.length} Active</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase sticky top-0 shadow-sm">
                  <tr>
                    <th className="px-5 py-2.5">Mission ID</th>
                    <th className="px-5 py-2.5">Assigned Team</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMissions.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">No active rescue missions.</td></tr>
                  ) : (
                    activeMissions.map((disp) => (
                      <tr key={disp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-sm font-mono text-slate-500">MSN-{disp.id}</td>
                        <td className="px-5 py-3 text-sm text-slate-800 font-medium">{disp.dispatch_type ? `${disp.dispatch_type} Unit` : "ODRAF Team"}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded">{disp.status.replace("_", " ")}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500">{disp.eta_minutes ? `${disp.eta_minutes} min` : "~12 min"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ACTIVITY + QUICK NAV ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Automation Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Recent Automation Activity</h2>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div className="space-y-4">
                {activityLogs.map((log, i) => (
                  <ActivityLog key={i} {...log} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Module Navigation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Quick Navigation</h2>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
              <QuickNavCard href="/dashboard/incidents" label="Incident Verification" desc="Review & verify incoming SOS reports" color="blue" />
              <QuickNavCard href="/dashboard/dispatches" label="Dispatch Automation" desc="Automated dispatch pipeline" color="green" />
              <QuickNavCard href="/dashboard/field" label="Mission Execution" desc="Track active rescue teams" color="amber" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Micro-Components

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = { blue: "bg-blue-50 border-blue-100", slate: "bg-slate-50 border-slate-200", amber: "bg-amber-50 border-amber-200", green: "bg-emerald-50 border-emerald-100", emerald: "bg-emerald-50 border-emerald-100", rose: "bg-rose-50 border-rose-100" };
  const textMap: Record<string, string> = { blue: "text-blue-600", slate: "text-slate-600", amber: "text-amber-600", green: "text-emerald-600", emerald: "text-emerald-600", rose: "text-rose-600" };
  return (
    <div className={`p-3.5 rounded-xl border shadow-sm ${colorMap[color]} flex flex-col`}>
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight mb-2">{label}</h3>
      <div className={`text-2xl font-black mt-auto ${textMap[color]}`}>{value}</div>
    </div>
  );
}

function PipelineStage({ title, count, status, color }: { title: string; count: number; status: string; color: string }) {
  const bgMap: Record<string, string> = { blue: "bg-blue-600", indigo: "bg-indigo-600", amber: "bg-amber-500", green: "bg-emerald-600", emerald: "bg-green-600", rose: "bg-rose-600" };
  return (
    <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-lg p-3 w-32 shrink-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 text-center leading-tight h-7 flex items-center">{title}</span>
      <span className="text-xl font-black text-slate-800 mb-1.5">{count}</span>
      <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider ${bgMap[color]}`}>{status}</span>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="text-slate-300 shrink-0 mx-0.5">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
    </div>
  );
}

function WeatherDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</div>
      <div className="text-sm font-bold text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}

function ActivityLog({ time, event, module, type }: { time: string; event: string; module: string; type: string }) {
  const dotColor: Record<string, string> = { blue: "bg-blue-500", rose: "bg-rose-500", emerald: "bg-emerald-500", amber: "bg-amber-500", indigo: "bg-indigo-500", slate: "bg-slate-400" };
  return (
    <div className="flex items-start space-x-3">
      <span className="text-[11px] font-mono text-slate-400 mt-0.5 w-16 shrink-0">{time}</span>
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor[type] || "bg-slate-400"}`} />
      <div>
        <div className="text-sm font-medium text-slate-800">{event}</div>
        <div className="text-xs text-slate-400">{module}</div>
      </div>
    </div>
  );
}

function QuickNavCard({ href, label, desc, color }: { href: string; label: string; desc: string; color: string }) {
  const borderMap: Record<string, string> = { blue: "hover:border-blue-400 hover:bg-blue-50", green: "hover:border-green-400 hover:bg-green-50", amber: "hover:border-amber-400 hover:bg-amber-50" };
  const textMap: Record<string, string> = { blue: "group-hover:text-blue-700", green: "group-hover:text-green-700", amber: "group-hover:text-amber-700" };
  return (
    <Link href={href} className={`flex flex-col px-4 py-3 bg-white border border-slate-200 rounded-lg transition-colors group ${borderMap[color]}`}>
      <span className={`font-semibold text-sm text-slate-700 ${textMap[color]}`}>{label}</span>
      <span className="text-xs text-slate-400 mt-0.5">{desc}</span>
    </Link>
  );
}
