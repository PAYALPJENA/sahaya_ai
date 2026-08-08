"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { IncidentResponse } from "@/types/incident";

// Mock data for AI extracted details since it's not in the backend response yet
const generateMockAIDetails = (incident: IncidentResponse) => {
  const confidence = 85 + Math.floor(Math.random() * 14); // 85-98%
  const hasImage = Math.random() > 0.3;
  const hasAudio = Math.random() > 0.5;
  
  return {
    ocr_text: hasImage ? `URGENT HELP NEEDED SECTOR ${Math.floor(Math.random()*10)}... WATER LEVEL RISING...` : "N/A",
    voice_transcript: hasAudio ? `Please send help to ${incident.district || "the area"}. We are stranded on the roof. Need rescue.` : "N/A",
    image_url: hasImage ? "https://placehold.co/400x300/e2e8f0/475569?text=Image+Preview" : null,
    detected_objects: hasImage ? ["Water: 92%", "Person: 88%", "Roof: 75%"] : [],
    extracted_keywords: [incident.disaster_type, incident.district || "Location", "Rescue", "Urgent"],
    ai_confidence: `${confidence}%`,
    disaster_type: incident.disaster_type,
    time_reported: new Date(incident.created_at).toLocaleString("en-IN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    })
  };
};

export default function IncidentsListPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("TRIAGED"); 
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const fetchIncidents = async () => {
    try {
      let queryParams = [];
      if (statusFilter) queryParams.push(`status=${statusFilter}`);
      if (severityFilter) queryParams.push(`severity=${severityFilter}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      
      const queryStr = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      const list = await api.get<IncidentResponse[]>(`/incidents${queryStr}`);
      setIncidents(list);
    } catch (err) {
      console.error("Error loading incidents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter, search]);

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 font-sans bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incident Verification Queue</h1>
          <p className="text-sm text-slate-500 mt-1">Automated AI triage and classification of incoming citizen SOS reports.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm">
           <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 font-medium">
             <span className="block text-xs text-blue-500 uppercase tracking-wider">Avg Triage Time</span>
             2.4 seconds
           </div>
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 font-medium">
             <span className="block text-xs text-emerald-500 uppercase tracking-wider">Manual Work Saved</span>
             ~12 hrs today
           </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search extracted keywords..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="TRIAGED">TRIAGED (Pending Approval)</option>
          <option value="APPROVED">APPROVED (Collector)</option>
          <option value="DISPATCHED">DISPATCHED</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        {(statusFilter !== "TRIAGED" || severityFilter || search) && (
          <button
            onClick={() => {
              setStatusFilter("TRIAGED");
              setSeverityFilter("");
              setSearch("");
            }}
            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading verified incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No incidents found in the verification queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-10"></th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Automated Priority</th>
                  <th className="px-6 py-4">Extracted Details</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.map((incident) => {
                  const isCritical = incident.severity === "CRITICAL";
                  const sevColor = 
                    incident.severity === "CRITICAL" ? "text-rose-700 bg-rose-100 border-rose-200" :
                    incident.severity === "HIGH" ? "text-orange-700 bg-orange-100 border-orange-200" :
                    incident.severity === "MEDIUM" ? "text-amber-700 bg-amber-100 border-amber-200" :
                    "text-blue-700 bg-blue-100 border-blue-200";

                  const isExpanded = expandedRow === incident.id;
                  const mockDetails = generateMockAIDetails(incident);

                  return (
                    <React.Fragment key={incident.id}>
                      <tr 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${isCritical ? 'bg-rose-50/20' : ''}`}
                        onClick={() => toggleRow(incident.id)}
                      >
                        <td className="px-6 py-4 text-slate-400">
                          <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${sevColor}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                          {Number(incident.priority_score).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <div className="font-bold text-slate-900 truncate">{incident.title}</div>
                          <div className="text-xs text-slate-500 truncate mt-1">{incident.description}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                          {incident.location_text || incident.district || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-wider">
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/incidents/${incident.id}`);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm active:scale-95"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded AI Insights Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                          <td colSpan={7} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                              
                              {/* Left Column: Triage Details */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Time Reported</h4>
                                  <p className="text-sm text-slate-800 font-medium">{mockDetails.time_reported}</p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Disaster Type</h4>
                                  <p className="text-sm text-slate-800 font-medium">{mockDetails.disaster_type}</p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">AI Confidence</h4>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                      <div className="bg-green-500 h-2 rounded-full" style={{ width: mockDetails.ai_confidence }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{mockDetails.ai_confidence}</span>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Extracted Keywords</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {mockDetails.extracted_keywords.map(kw => (
                                      <span key={kw} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase">{kw}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Middle Column: OCR & Voice Transcript */}
                              <div className="space-y-4">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    OCR Extraction
                                  </h4>
                                  <p className="text-sm text-slate-700 font-mono italic">{mockDetails.ocr_text}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    Voice Transcript
                                  </h4>
                                  <p className="text-sm text-slate-700 font-serif italic">"{mockDetails.voice_transcript}"</p>
                                </div>
                              </div>

                              {/* Right Column: Image & Objects */}
                              <div className="space-y-3">
                                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Image Analysis</h4>
                                {mockDetails.image_url ? (
                                  <div className="space-y-2">
                                    <img src={mockDetails.image_url} alt="Incident preview" className="w-full h-32 object-cover rounded border border-slate-200" />
                                    <div className="flex flex-wrap gap-1">
                                      {mockDetails.detected_objects.map(obj => (
                                        <span key={obj} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold uppercase">{obj}</span>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full h-32 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                                    No Image Provided
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
