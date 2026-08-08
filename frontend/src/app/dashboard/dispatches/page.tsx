"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DispatchOperationsPage() {
  const router = useRouter();
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDispatches = async () => {
      try {
        const data = await api.get<any[]>("/dispatches");
        setDispatches(data);
      } catch (err) {
        console.error("Failed to load dispatches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDispatches();
  }, []);

  const activeCount = dispatches.filter(d => d.status === "DISPATCHED" || d.status === "EN_ROUTE").length;
  const completedCount = dispatches.filter(d => d.status === "RESOLVED" || d.status === "COMPLETED").length;
  const pendingCount = dispatches.filter(d => d.status === "NEW" || d.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dispatch Automation</h1>
        <p className="text-slate-500 mt-1">Automatically generates dispatch orders after Collector approval.</p>
      </div>

      {/* HORIZONTAL WORKFLOW */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-x-auto">
        <div className="flex items-center min-w-max space-x-2 text-sm font-bold">
          <div className="flex items-center text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded">Collector Approves</span>
            <svg className="w-5 h-5 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
          <div className="flex items-center text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded">Dispatch Order Generated</span>
            <svg className="w-5 h-5 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
          <div className="flex items-center text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded">Resources Reserved</span>
            <svg className="w-5 h-5 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
          <div className="flex items-center text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded">Nearest Team Assigned</span>
            <svg className="w-5 h-5 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
          <div className="flex items-center text-slate-500">
            <span className="bg-slate-100 px-3 py-1 rounded">Hospital Notified</span>
            <svg className="w-5 h-5 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
          <div className="flex items-center text-blue-700">
            <span className="bg-blue-100 border border-blue-200 px-3 py-1 rounded flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-ping" />
              Citizen Tracking Updated
            </span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Dispatches</div>
          <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Dispatches</div>
          <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed Dispatches</div>
          <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average Dispatch Time</div>
          <div className="text-2xl font-bold text-slate-900">1.2 mins</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT/CENTER: Main Workspace */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Dispatch Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Automatically Generated Dispatch Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading dispatch records...</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Dispatch ID</th>
                      <th className="px-4 py-3">Incident ID</th>
                      <th className="px-4 py-3">Assigned Team</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Automated Action</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">ETA</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dispatches.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          No dispatch orders generated yet.
                        </td>
                      </tr>
                    ) : (
                      dispatches.map((dsp) => (
                        <tr key={dsp.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">{String(dsp.id).split("-")[0].toUpperCase()}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{String(dsp.incident_id).split("-")[0].toUpperCase()}</td>
                          <td className="px-4 py-3 text-slate-900">{dsp.assigned_team || "Pending"}</td>
                          <td className="px-4 py-3 text-slate-600 truncate max-w-[120px]">{dsp.destination || "TBD"}</td>
                          <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                            {dsp.status === 'COMPLETED' || dsp.status === 'RESOLVED' ? 'Citizen Tracking Started' : 
                             dsp.status === 'DISPATCHED' || dsp.status === 'EN_ROUTE' ? 'Hospital Notified' : 'Team Assigned Automatically'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              dsp.status === 'COMPLETED' || dsp.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                              dsp.status === 'DISPATCHED' || dsp.status === 'EN_ROUTE' ? 'bg-blue-100 text-blue-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {dsp.status === 'COMPLETED' || dsp.status === 'RESOLVED' ? 'Completed' :
                               dsp.status === 'DISPATCHED' || dsp.status === 'EN_ROUTE' ? 'Running' : 'Waiting'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">{dsp.eta || "--"}</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wide">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Derived Operational Information - Hospital Coordination */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Hospital Coordination</h2>
              <span className="text-xs bg-white border border-slate-300 text-slate-600 px-2 py-1 rounded font-medium shadow-sm">
                Derived from Dispatch Workflow
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Nearest Hospital</div>
                  <div className="font-bold text-slate-900">City General (2.4km)</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Available Beds</div>
                  <div className="font-bold text-slate-900">14 Trauma / 42 Ward</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Ambulance Assigned</div>
                  <div className="font-bold text-slate-900">Unit AMB-04</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Notification Sent</div>
                  <div className="font-bold text-emerald-600">Delivered</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Expected Arrival</div>
                  <div className="font-bold text-emerald-600">T+14 mins</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Automation Impact & Details */}
        <div className="space-y-6">
          
          {/* Automation Impact Box */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="font-bold text-white uppercase tracking-wide text-sm">Automation Impact</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-slate-500 text-sm font-bold uppercase mb-1">Manual Dispatch Preparation</div>
                <div className="text-xl font-bold text-slate-400 line-through">≈ 15 minutes</div>
                
                <svg className="w-6 h-6 text-slate-300 my-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                
                <div className="text-blue-600 text-sm font-bold uppercase mb-1">Digital Dispatch Generation</div>
                <div className="text-3xl font-bold text-blue-700">≈ 15 seconds</div>
              </div>
              
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Phone calls eliminated
                </div>
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Paper forms eliminated
                </div>
                <div className="flex items-center text-emerald-600 font-medium text-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Duplicate entries eliminated
                </div>
              </div>
            </div>
          </div>

          {/* WHAT WAS AUTOMATED? Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-800 uppercase tracking-wide text-sm">What Was Automated?</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-500 mb-3 border-b pb-2 text-xs uppercase tracking-wider">Manual Process</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Call available teams</li>
                    <li>• Check vehicle availability</li>
                    <li>• Write dispatch order</li>
                    <li>• Call nearest hospital</li>
                    <li>• Update citizen manually</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-emerald-600 mb-3 border-b border-emerald-100 pb-2 text-xs uppercase tracking-wider">Automated Process</h4>
                  <ul className="space-y-2 text-sm font-medium text-slate-800">
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Team selected automatically</li>
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Vehicle allocated automatically</li>
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Digital dispatch created</li>
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Hospital notified automatically</li>
                    <li className="flex items-center"><span className="text-emerald-500 mr-2">✓</span> Citizen tracking updated automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
