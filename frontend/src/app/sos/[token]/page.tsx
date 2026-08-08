"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { SOSStatusResponse } from "@/types/sos";

export default function CitizenTrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  const [data, setData] = useState<SOSStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eta, setEta] = useState(14 * 60); // 14 mins in seconds

  const fetchStatus = async () => {
    try {
      const res = await api.get<SOSStatusResponse>(`/sos/${token}/status`);
      setData(res);
    } catch (err: any) {
      setError("Unable to find status for tracking ID: " + token);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
      setEta(prev => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading tracking status...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tracking ID Not Found</h1>
        <p className="text-slate-600 mb-8">{error}</p>
        <button
          onClick={() => router.push("/sos")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
        >
          Return to SOS Portal
        </button>
      </div>
    );
  }

  const formatEta = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m} Minutes`;
  };

  // Format Date for report time
  const formatReportTime = (isoString: string) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" }); // "8 August"
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }); // "12:42 AM"
    return `${dateStr}\n${timeStr}`;
  };

  // Compute status progression
  const statusEnum = data.incident_status || "NEW";
  const isProcessed = data.processed;
  const isApproved = ["APPROVED", "DISPATCHED", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(statusEnum);
  const isAssigned = ["DISPATCHED", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(statusEnum);
  const isDispatched = ["IN_PROGRESS", "RESOLVED", "CLOSED"].includes(statusEnum) || statusEnum === "DISPATCHED";
  const isArrived = ["RESOLVED", "CLOSED"].includes(statusEnum);

  // Define steps for vertical tracker
  const steps = [
    { id: 1, label: "Emergency Report Submitted", done: true, isCurrent: !isProcessed },
    { id: 2, label: "AI Verified Your Report", done: isProcessed, isCurrent: isProcessed && !isApproved && statusEnum === "TRIAGED" },
    { id: 3, label: "Forwarded to District Control Room", done: isProcessed, isCurrent: false }, 
    { id: 4, label: isApproved ? "Collector Approved" : "Waiting for Collector Approval", done: isApproved, isCurrent: isProcessed && !isApproved },
    { id: 5, label: "Rescue Team Assigned", done: isAssigned, isCurrent: isApproved && !isAssigned },
    { id: 6, label: "Rescue Team Dispatched", done: isDispatched, isCurrent: isAssigned && !isDispatched },
    { id: 7, label: "Rescue Team Arrived", done: isArrived, isCurrent: isDispatched && !isArrived }
  ];

  const currentStepId = steps.slice().reverse().find(s => s.isCurrent || s.done)?.id || 1;
  const currentStatusLabel = steps.find(s => s.id === currentStepId)?.label || "Processing...";

  // Dummy coordinate for OpenStreetMap
  const lat = 20.4625;
  const lng = 85.8830; // Coordinates near Cuttack
  const bbox = `${lng-0.005},${lat-0.005},${lng+0.005},${lat+0.005}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP SUMMARY */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Rescue Tracking Status</h1>
          </div>
          
          <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
            <div>
              <div className="text-sm text-slate-500 font-semibold mb-1">Tracking ID</div>
              <div className="text-lg font-bold text-slate-900 font-mono">{token}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-semibold mb-1">Status</div>
              <div className="text-lg font-bold text-blue-700">{currentStatusLabel}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-semibold mb-1">ETA</div>
              <div className="text-2xl font-bold text-emerald-600">{formatEta(eta)}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-semibold mb-1">District</div>
              <div className="text-lg font-bold text-slate-900">Cuttack</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-semibold mb-1">Emergency Type</div>
              <div className="text-lg font-bold text-slate-900">Flood</div>
            </div>
            <div>
              <div className="text-sm text-slate-500 font-semibold mb-1">Report Time</div>
              <div className="text-lg font-bold text-slate-900 whitespace-pre-line">
                {formatReportTime(data.submitted_at.toString())}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PROGRESS TRACKER (Straight Vertical Line) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-8">Live Progress</h2>
            
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
              {steps.map((step) => {
                const isCompleted = step.done && !step.isCurrent;
                const isCurrent = step.isCurrent;

                return (
                  <div key={step.id} className="relative pl-8">
                    {/* Circle */}
                    <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white
                      ${isCompleted ? "border-green-500" : isCurrent ? "border-amber-400" : "border-slate-300"}
                    `}>
                      {isCompleted && <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>}
                      {isCurrent && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></div>}
                    </div>

                    {/* Text */}
                    <div className={`font-bold text-base ${
                      isCompleted ? "text-slate-900" :
                      isCurrent ? "text-blue-700" :
                      "text-slate-400"
                    }`}>
                      {isCompleted ? `✓ ${step.label}` : isCurrent ? `🟡 ${step.label}` : `⬜ ${step.label}`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COLLECTOR APPROVAL SECTION */}
            {isApproved && (
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Approved By</div>
                <div className="font-bold text-slate-900">District Collector</div>
                <div className="text-slate-600 text-sm">Cuttack</div>
                <div className="text-slate-500 text-xs mt-1">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</div>
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col">
            
            {/* MAP SECTION */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="h-56 bg-slate-200 relative w-full overflow-hidden">
                {/* Real OpenStreetMap iframe embed */}
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={mapUrl}
                  style={{ border: 0 }}
                  title="Incident Location Map"
                ></iframe>
              </div>
              
              <div className="p-5 bg-white">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reported Location</div>
                <div className="text-slate-900 font-bold text-base">Subhas Nagar Sector 3</div>
                <div className="text-slate-600 text-sm mb-3">Near Hanuman Temple<br />Cuttack</div>
                <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-md">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span className="text-slate-600 text-xs font-semibold">GPS Accuracy: 13 metres</span>
                </div>
              </div>
            </div>

            {/* RESCUE TEAM */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Rescue Team</h2>
              {isDispatched ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Assigned Team</div>
                      <div className="font-bold text-slate-900 text-lg">ODRAF Team 3</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Vehicle</div>
                      <div className="font-bold text-slate-900 text-lg">Inflatable Rescue Boat</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current Status</div>
                      <div className="font-bold text-emerald-600 text-lg">En Route</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ETA</div>
                      <div className="font-bold text-slate-900 text-lg">{formatEta(eta)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-slate-600 font-medium">No rescue team has been assigned yet.</p>
                  <p className="text-slate-400 text-sm mt-1">We will notify you once a team is dispatched.</p>
                </div>
              )}
            </div>

            {/* HELP SECTION */}
            <div className="bg-rose-50 rounded-xl shadow-sm border border-rose-100 p-6 mt-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-rose-900">Need Immediate Help?</h2>
                <a 
                  href="tel:112" 
                  className="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-lg rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>Call 112</span>
                </a>
              </div>
              <div className="space-y-3 bg-white/50 p-4 rounded-lg">
                <div className="text-sm font-bold text-rose-800 uppercase tracking-wide">Safety Instructions</div>
                <ul className="text-sm text-rose-900 space-y-2 list-disc pl-5 font-medium">
                  <li>Move to higher ground immediately.</li>
                  <li>Keep your phone charged.</li>
                  <li>Avoid floodwater.</li>
                  <li>Keep important documents safe in waterproof bags.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
