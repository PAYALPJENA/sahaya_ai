"use client";

import { useState } from "react";
import Link from "next/link";

export default function MissionExecutionPage() {
  const [missions] = useState([
    {
      id: "MSN-8924",
      team: "ODRAF Unit Alpha",
      status: "Reached Location",
      eta: "On Site",
      location: "Sector 4, Khordha",
      gps: "20.29°N, 85.82°E",
      progress: 4, // out of 7
      members: [
        { role: "Leader", name: "Rajesh Kumar" },
        { role: "Medic", name: "Dr. Ananya S." },
        { role: "Fire Officer", name: "Vikram P." },
      ]
    },
    {
      id: "MSN-8925",
      team: "NDRF Team B",
      status: "Team En Route",
      eta: "14 mins",
      location: "Puri Coastal Road",
      gps: "19.81°N, 85.83°E",
      progress: 3, // out of 7
      members: [
        { role: "Leader", name: "Suresh N." },
        { role: "NDRF Personnel", name: "Amit T." },
        { role: "Police", name: "Inspector Rout" },
      ]
    }
  ]);

  const mapCenterLat = 20.296;
  const mapCenterLng = 85.824;
  const mapBbox = `${mapCenterLng - 0.2},${mapCenterLat - 0.2},${mapCenterLng + 0.2},${mapCenterLat + 0.2}`;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${mapCenterLat},${mapCenterLng}`;

  const progressSteps = [
    "Mission Created",
    "Team Assigned",
    "Team En Route",
    "Reached Location",
    "Evacuation Started",
    "Medical Support",
    "Mission Completed"
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mission Execution & Coordination</h1>
          <p className="text-sm text-slate-500 mt-1">Live tracking and coordination of active field rescue operations.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 font-medium flex items-center">
             <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping" />
             {missions.length} Active Missions
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Mission Cards */}
        <div className="lg:col-span-7 space-y-6">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {mission.id}
                  </div>
                  <h2 className="font-bold text-slate-900">{mission.team}</h2>
                </div>
                <div className="text-sm font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded shadow-sm">
                  {mission.status}
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Target Location</h4>
                    <p className="text-sm text-slate-800 font-medium">{mission.location}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">GPS Coordinates</h4>
                    <p className="text-sm text-slate-800 font-medium">{mission.gps}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">ETA</h4>
                    <p className="text-sm text-slate-800 font-medium">{mission.eta}</p>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest border-b border-slate-100 pb-1">Assigned Personnel</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mission.members.map((m, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{m.role}</span>
                        <span className="text-xs font-medium text-slate-700">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest">Mission Progress</h4>
                  <div className="relative">
                    {/* Background Track */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
                    {/* Active Track */}
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: `${((mission.progress - 1) / (progressSteps.length - 1)) * 100}%` }}
                    />
                    
                    {/* Nodes */}
                    <div className="relative flex justify-between">
                      {progressSteps.map((step, idx) => {
                        const isCompleted = idx < mission.progress;
                        const isCurrent = idx === mission.progress - 1;
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 z-10 transition-colors ${
                              isCompleted ? 'bg-emerald-500 border-emerald-500' : 
                              isCurrent ? 'bg-white border-emerald-500 ring-2 ring-emerald-200' : 
                              'bg-white border-slate-300'
                            }`} />
                            <div className={`absolute top-5 text-[9px] font-bold uppercase tracking-wider text-center w-20 -ml-10 ${
                              isCurrent ? 'text-emerald-700' : 'text-slate-400 hidden md:block'
                            }`}>
                              {isCurrent ? step : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Step list for mobile or full detail */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                     {progressSteps.map((step, idx) => (
                       <div key={idx} className={`flex items-center space-x-1 ${idx < mission.progress ? 'text-emerald-600' : 'text-slate-300'}`}>
                         <span>{idx < mission.progress ? '✓' : '○'}</span>
                         <span className="truncate">{step}</span>
                       </div>
                     ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Live Map & Comms */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Operations Map */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Live Operations Map</h2>
              <div className="flex space-x-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span><span className="text-slate-500">Teams</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span><span className="text-slate-500">Citizen</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span><span className="text-slate-500">Hospital</span></span>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-100 relative">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapUrl}
                style={{ border: 0 }}
                title="Mission Tracking Map"
              />
            </div>
          </div>

          {/* Coordination Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
              <h2 className="font-bold text-slate-800 text-sm">Coordination Log</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSN-8924 • Just Now</div>
                <div className="text-sm font-medium text-slate-800">Team has reached the target location. Commencing evacuation.</div>
              </div>
              <div className="border-l-2 border-blue-500 pl-4 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MSN-8925 • 4 mins ago</div>
                <div className="text-sm font-medium text-slate-800">Team departed staging area. Navigating via alternate route due to flooding.</div>
              </div>
              <div className="border-l-2 border-slate-300 pl-4 space-y-1 opacity-70">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SYSTEM • 12 mins ago</div>
                <div className="text-sm font-medium text-slate-800">Mission MSN-8925 created and team assigned automatically.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
