"use client";

import { useState } from "react";

export default function AutomationLogsPage() {
  const [logs] = useState([
    { time: "14:25:08", incident: "INC-8924", module: "Citizen Tracking", action: "Citizen Updated (SMS Sent)", performedBy: "Sahaya AI", status: "Success", type: "blue" },
    { time: "14:25:05", incident: "INC-8924", module: "Hospital API", action: "Hospital Notified (City General)", performedBy: "Sahaya AI", status: "Success", type: "blue" },
    { time: "14:25:02", incident: "INC-8924", module: "Dispatch Automation", action: "Dispatch Generated (NDRF_03)", performedBy: "Sahaya AI", status: "Success", type: "emerald" },
    { time: "14:25:01", incident: "INC-8924", module: "Collector Approval", action: "Collector Approved", performedBy: "District Collector", status: "Success", type: "amber" },
    { time: "14:22:19", incident: "INC-8924", module: "AI Triage", action: "AI Classified (Severity: HIGH)", performedBy: "Sahaya AI", status: "Success", type: "indigo" },
    { time: "14:22:18", incident: "INC-8924", module: "SOS Portal", action: "Citizen Submitted", performedBy: "Citizen (App)", status: "Success", type: "slate" },
  ]);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "Success": return "bg-emerald-100 text-emerald-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Failed": return "bg-rose-100 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case "blue": return "bg-blue-100 text-blue-700";
      case "emerald": return "bg-emerald-100 text-emerald-700";
      case "amber": return "bg-amber-100 text-amber-700";
      case "indigo": return "bg-indigo-100 text-indigo-700";
      case "slate": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Automation Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Operational workflow logs tracking the end-to-end disaster response process.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm">
           <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">
             Export CSV
           </button>
           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
             Live Stream: ON
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-700">Recent Workflow Events</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search incident ID or module..." 
              className="pl-8 pr-4 py-1.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* LOG TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 shadow-sm">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Incident</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">{log.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600 cursor-pointer hover:underline">{log.incident}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getBadgeColor(log.type)}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">{log.performedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${getStatusStyle(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
          <span>Showing 1 to {logs.length} of {logs.length} entries</span>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 border border-blue-500 rounded bg-blue-50 text-blue-600 font-bold">1</button>
            <button className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-600">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
}
