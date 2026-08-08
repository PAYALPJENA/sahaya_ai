"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { IncidentResponse, AIRecommendationResponse } from "@/types/incident";

export default function CollectorApprovalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [incident, setIncident] = useState<IncidentResponse | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [reason, setReason] = useState("Authorized based on verified emergency parameters.");
  const [customResources, setCustomResources] = useState<Array<{ type: string; quantity: number }>>([]);
  const [modifying, setModifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const fetchDetails = async () => {
    try {
      const inc = await api.get<IncidentResponse>(`/incidents/${id}`);
      setIncident(inc);
      
      const recs = await api.get<AIRecommendationResponse[]>(`/incidents/${id}/recommendations`);
      setRecommendations(recs);

      const activeRec = recs.find(r => r.is_active);
      if (activeRec && customResources.length === 0) {
        setCustomResources(activeRec.recommendation_data.resources || []);
      }
      
      if (["APPROVED", "RESOLVED", "DISPATCHED"].includes(inc.status)) {
        setAuthorized(true);
      }
    } catch (err) {
      console.error("Error loading incident details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleApprove = async (decisionType: "APPROVED" | "MODIFIED" | "REJECTED") => {
    if (!incident || recommendations.length === 0) return;
    const activeRec = recommendations.find(r => r.is_active);
    if (!activeRec) return;

    setSubmitting(true);
    try {
      const body: any = {
        recommendation_id: activeRec.id,
        decision: decisionType,
        reason: reason,
      };

      if (decisionType === "MODIFIED") {
        body.modifications = { resources: customResources };
      }

      await api.post(`/incidents/${incident.id}/approve`, body);
      await fetchDetails();
      
      if (decisionType !== "REJECTED") {
        setAuthorized(true);
      }
    } catch (err) {
      alert("Error processing authorization.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateResourceQty = (index: number, newQty: number) => {
    const updated = [...customResources];
    updated[index].quantity = Math.max(0, newQty);
    setCustomResources(updated);
    setModifying(true);
  };

  if (loading || !incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-sans">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-slate-500 font-medium">Loading Approval Data...</span>
      </div>
    );
  }

  const activeRec = recommendations.find(r => r.is_active);
  const showApprovalPanel = ["NEW", "TRIAGED", "UNDER_REVIEW"].includes(incident.status) && !authorized;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <button onClick={() => router.push("/dashboard/incidents")} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              &larr; Back to Queue
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-bold text-slate-500">Incident #{String(incident.id).split("-")[0].toUpperCase()}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Collector Approval</h1>
        </div>
        
        {authorized ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg font-bold flex items-center shadow-sm">
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             Approved for Dispatch
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg font-bold flex items-center shadow-sm">
             <div className="w-2 h-2 rounded-full bg-amber-500 mr-3 animate-ping" />
             Pending Final Approval
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Context & Warning */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Incident Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center uppercase tracking-wide text-sm">
              <span>Incident Details</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 mt-1 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900">{incident.location_text || incident.district || "Unknown Location"}</div>
                  <div className="text-xs text-slate-500 mt-1">Reported: {new Date(incident.created_at).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="border-t border-slate-100 my-2" />
              <div>
                <p className="text-slate-800 font-medium">{incident.title}</p>
                <p className="text-slate-600 text-sm mt-1">{incident.description}</p>
              </div>
            </div>
          </div>

          {/* Weather Warning Card */}
          <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-100 px-6 py-3 border-b border-red-200 font-bold text-red-800 flex items-center uppercase tracking-wide text-sm gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              IMD Weather Warning
            </div>
            <div className="p-6">
              <p className="text-sm font-bold text-red-900 mb-2">Severe Cyclone Alert for {incident.district || "this district"}</p>
              <p className="text-sm text-red-700">Wind speeds expected to reach 120km/h within the next 4 hours. Heavy rainfall predicted. Rescue operations should be expedited.</p>
            </div>
          </div>

          {/* Nearby Context */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center uppercase tracking-wide text-sm">
              <span>Nearby Context</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Hospitals</h4>
                  <ul className="text-sm space-y-2 text-slate-700">
                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>Dist. Hospital</span> <span className="font-bold">2.4 km</span></li>
                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>City Clinic</span> <span className="font-bold">5.1 km</span></li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Shelters</h4>
                  <ul className="text-sm space-y-2 text-slate-700">
                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>Relief Camp 1</span> <span className="font-bold">1.2 km</span></li>
                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>Govt School</span> <span className="font-bold">3.8 km</span></li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Rescue Teams</h4>
                  <ul className="text-sm space-y-2 text-slate-700">
                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>ODRAF Unit</span> <span className="font-bold">4.5 km</span></li>
                    <li className="flex justify-between border-b border-slate-200 pb-1"><span>NDRF Team A</span> <span className="font-bold">8.0 km</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Recommendation & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full border-t-4 border-t-blue-600">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-blue-900 uppercase tracking-wide text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Recommendation Panel
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{activeRec ? `${activeRec.confidence_score}% Confidence` : 'N/A'}</span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              {activeRec ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">Recommended Priority</div>
                      <div className={`font-bold ${incident.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>{incident.severity}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">Est. Response Time</div>
                      <div className="font-bold text-emerald-600">~14 mins</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">AI Reasoning</div>
                    <p className="text-sm text-slate-700 bg-blue-50/50 p-4 rounded-lg border border-blue-100 leading-relaxed font-medium">
                      {activeRec.reasoning || "Based on flood severity and population density, immediate evacuation is necessary."}
                    </p>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-3">Recommended Resources</div>
                    <div className="space-y-2">
                      {customResources.map((res, index) => (
                        <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                          <span className="font-bold text-slate-700 text-sm">{res.type}</span>
                          
                          {showApprovalPanel ? (
                            <div className="flex items-center space-x-3 bg-slate-50 rounded-md border border-slate-200 px-2 py-1">
                              <button onClick={() => handleUpdateResourceQty(index, res.quantity - 1)} className="text-slate-500 hover:text-slate-900 font-bold px-2">-</button>
                              <span className="font-bold text-slate-900 w-6 text-center">{res.quantity}</span>
                              <button onClick={() => handleUpdateResourceQty(index, res.quantity + 1)} className="text-slate-500 hover:text-slate-900 font-bold px-2">+</button>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md">{res.quantity}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {showApprovalPanel && (
                    <div className="pt-4 border-t border-slate-100 mt-auto space-y-4">
                      
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2">Authorization Note</div>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => alert("Requesting more information from on-ground reporters...")}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors"
                        >
                          Request Info
                        </button>
                        <button
                          onClick={() => alert("Escalating to State Authorities...")}
                          className="py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-lg text-sm transition-colors"
                        >
                          Escalate
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleApprove(modifying ? "MODIFIED" : "APPROVED")}
                        disabled={submitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center text-sm uppercase tracking-wide"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>Approve &amp; Create Dispatch</span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleApprove("REJECTED")}
                        disabled={submitting}
                        className="w-full py-3 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm uppercase tracking-wide"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p>No dispatch recommendation available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
