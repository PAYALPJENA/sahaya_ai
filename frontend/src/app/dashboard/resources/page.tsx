"use client";

import { useState } from "react";

export default function ResourcesAndSheltersPage() {
  // Mock data matching the new requested structure
  const [resources] = useState([
    { category: "Vehicles", items: [
      { name: "Ambulances", total: 45, available: 12, status: "Critical" },
      { name: "Rescue Boats", total: 120, available: 45, status: "Healthy" },
      { name: "Fire Units", total: 18, available: 4, status: "Warning" },
    ]},
    { category: "Personnel", items: [
      { name: "NDRF Teams", total: 15, available: 2, status: "Critical" },
      { name: "ODRAF Teams", total: 20, available: 5, status: "Warning" },
      { name: "Medical Teams", total: 40, available: 18, status: "Healthy" },
    ]},
    { category: "Supplies & Facilities", items: [
      { name: "Food Kits", total: 15000, available: 12500, status: "Healthy" },
      { name: "Medical Kits", total: 800, available: 150, status: "Critical" },
      { name: "Hospital Beds", total: 450, available: 42, status: "Critical" },
    ]}
  ]);

  const [shelters] = useState([
    { id: 1, name: "Relief Camp 1 (Govt High School)", capacity: 500, occupancy: 480, distance: "1.2 km", status: "Nearing Capacity", alerts: ["Low on Medical Kits"] },
    { id: 2, name: "Shelter 4 (Community Hall)", capacity: 300, occupancy: 120, distance: "3.5 km", status: "Available", alerts: [] },
    { id: 3, name: "Kalinga Stadium Relief Center", capacity: 2000, occupancy: 1950, distance: "5.1 km", status: "Full", alerts: ["Food Ration Low", "Need Medical Team"] },
    { id: 4, name: "Puri Coastal Shelter", capacity: 800, occupancy: 210, distance: "45 km", status: "Available", alerts: [] },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Warning': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Nearing Capacity': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Full': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resources &amp; Shelters</h1>
          <p className="text-sm text-slate-500 mt-1">Live inventory of district emergency assets and shelter capacity.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm">
           <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 font-medium text-center">
             <span className="block text-xs text-blue-500 uppercase tracking-wider">Total Assets</span>
             16,140
           </div>
           <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg border border-rose-100 font-medium text-center">
             <span className="block text-xs text-rose-500 uppercase tracking-wider">Critical Alerts</span>
             4 Depleted
           </div>
        </div>
      </div>

      {/* RESOURCE SUMMARY */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide px-2">Resource Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 font-bold text-slate-700 text-xs uppercase tracking-wider">
                {cat.category}
              </div>
              <div className="p-5 space-y-5">
                {cat.items.map((item, i) => {
                  const util = Math.round(((item.total - item.available) / item.total) * 100);
                  const isCritical = item.status === "Critical";
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm items-center">
                        <span className={`font-bold ${isCritical ? 'text-rose-700' : 'text-slate-800'}`}>{item.name}</span>
                        <span className="text-slate-500 font-medium">{item.available} <span className="text-xs">/ {item.total}</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : item.status === 'Warning' ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                          style={{ width: `${util}%` }} 
                        />
                      </div>
                      <div className="text-[10px] flex justify-between font-bold uppercase tracking-wider">
                        <span className="text-slate-400">Deployed: {util}%</span>
                        <span className={`${isCritical ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHELTER TABLE */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide px-2">Active Shelters</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Shelter</th>
                  <th className="px-6 py-4 text-center">Capacity</th>
                  <th className="px-6 py-4 text-center">Current Occupancy</th>
                  <th className="px-6 py-4">Distance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Low Stock Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shelters.map((shelter) => {
                  const isFull = shelter.occupancy >= shelter.capacity;
                  const util = Math.round((shelter.occupancy / shelter.capacity) * 100);
                  
                  return (
                    <tr key={shelter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{shelter.name}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">{shelter.capacity}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-slate-900'}`}>{shelter.occupancy}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({util}%)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{shelter.distance}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusColor(shelter.status)}`}>
                          {shelter.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {shelter.alerts.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {shelter.alerts.map((alert, i) => (
                              <span key={i} className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />
                                {alert}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No alerts</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
