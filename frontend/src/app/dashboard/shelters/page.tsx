"use client";

import { useState } from "react";

export default function ShelterManagementPage() {
  const [shelters] = useState([
    { id: "SHL-01", name: "GOVT HIGHSCHOOL, SEC 4", capacity: 500, current: 480, status: "CRITICAL", power: "GENERATOR", food: "2 DAYS" },
    { id: "SHL-02", name: "COMMUNITY HALL, SEC 2", capacity: 200, current: 150, status: "STABLE", power: "GRID", food: "5 DAYS" },
    { id: "SHL-03", name: "INDOOR STADIUM", capacity: 1500, current: 400, status: "STABLE", power: "GRID", food: "7 DAYS" },
    { id: "SHL-04", name: "PRIMARY SCHOOL, SEC 9", capacity: 100, current: 110, status: "OVERFLOW", power: "NONE", food: "12 HOURS" },
  ]);

  return (
    <div className="h-full flex flex-col font-mono text-white bg-black">
      {/* HEADER */}
      <div className="shrink-0 p-4 border-b border-slate-800 bg-black flex justify-between items-center">
        <div>
          <div className="text-xl font-bold tracking-widest text-white">SHELTER_COMMAND_NODE</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">CAPACITY & LOGISTICS TRACKING</div>
        </div>
        <div className="flex space-x-4">
          <div className="px-3 py-1 bg-red-950 border border-red-900 text-red-500 text-xs font-bold">1 OVERFLOW</div>
          <div className="px-3 py-1 bg-emerald-950 border border-emerald-900 text-emerald-500 text-xs font-bold">3 STABLE</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 min-h-0">
        {/* LEFT: SHELTER LIST */}
        <div className="col-span-8 border-r border-slate-800 flex flex-col min-h-0">
          <div className="shrink-0 grid grid-cols-12 gap-2 p-2 border-b border-slate-800 bg-slate-950 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <div className="col-span-2">ID</div>
            <div className="col-span-4">DESIGNATION</div>
            <div className="col-span-2">UTILIZATION</div>
            <div className="col-span-1">POWER</div>
            <div className="col-span-2">FOOD_RATIONS</div>
            <div className="col-span-1">STATUS</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {shelters.map((s, i) => {
              const utilPercent = Math.round((s.current / s.capacity) * 100);
              const isOver = utilPercent > 100;
              const isCritical = utilPercent > 90 && !isOver;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 p-3 border-b border-slate-800 hover:bg-slate-900 items-center text-xs transition-colors cursor-pointer">
                  <div className="col-span-2 text-indigo-400 font-bold">{s.id}</div>
                  <div className="col-span-4 text-slate-300 truncate">{s.name}</div>
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <span className={`${isOver ? 'text-red-500' : isCritical ? 'text-amber-500' : 'text-emerald-500'} font-bold w-8`}>{utilPercent}%</span>
                      <div className="flex-1 h-1.5 bg-slate-800 overflow-hidden">
                        <div className={`h-full ${isOver ? 'bg-red-500' : isCritical ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(utilPercent, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 text-slate-400 text-[10px]">{s.power}</div>
                  <div className="col-span-2 text-slate-400 text-[10px]">{s.food}</div>
                  <div className="col-span-1">
                    <span className={`px-2 py-0.5 text-[9px] font-bold ${
                      s.status === 'OVERFLOW' ? 'bg-red-950 text-red-500 border border-red-900 animate-pulse' :
                      s.status === 'CRITICAL' ? 'bg-amber-950 text-amber-500 border border-amber-900' :
                      'bg-emerald-950 text-emerald-500 border border-emerald-900'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: MAP & DETAILS */}
        <div className="col-span-4 flex flex-col bg-slate-950/30">
          <div className="h-64 border-b border-slate-800 relative bg-black flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
             <div className="text-slate-700 text-xs font-bold">[ GIS_MAP_FEED_OFFLINE ]</div>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="border border-indigo-900 bg-indigo-950/20 p-4">
              <div className="text-indigo-400 text-[10px] font-bold mb-2">AI_LOGISTICS_RECOMMENDATION</div>
              <div className="text-white text-xs leading-relaxed">
                Reroute incoming evacuees from SEC 9 to INDOOR STADIUM. Dispatch emergency food supplies to SHL-04 within 8 hours to prevent starvation.
              </div>
            </div>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest text-xs uppercase transition-colors">
              [ EXECUTE_LOGISTICS_REROUTE ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
