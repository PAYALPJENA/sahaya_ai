"use client";

export default function AnalyticsPage() {
  // Mock Data for Charts
  const districtData = [
    { name: "Khordha", value: 342, percentage: 35 },
    { name: "Puri", value: 210, percentage: 22 },
    { name: "Cuttack", value: 180, percentage: 19 },
    { name: "Ganjam", value: 125, percentage: 13 },
    { name: "Balasore", value: 105, percentage: 11 },
  ];

  const disasterTypeData = [
    { type: "Flood", value: 65, color: "bg-blue-500" },
    { type: "Cyclone", value: 20, color: "bg-teal-500" },
    { type: "Medical", value: 10, color: "bg-rose-500" },
    { type: "Fire", value: 5, color: "bg-orange-500" },
  ];

  const responseTrend = [35, 30, 25, 20, 18, 14, 12]; // Mock trend data representing minutes over last 7 days

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-sans bg-slate-50 min-h-screen">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Automation Metrics</h1>
          <p className="text-sm text-slate-500 mt-1">Operational analytics and efficiency tracking for Sahaya AI.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4 text-sm">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 font-medium">
             <span className="block text-xs text-emerald-500 uppercase tracking-wider">Manual Work Saved</span>
             ~12 hrs today
           </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <MetricCard label="Today's Incidents" value="1,248" trend="+14% vs yesterday" trendType="up" />
        <MetricCard label="People Rescued" value="3,412" trend="+120 this hour" trendType="up" />
        <MetricCard label="AI Accuracy" value="94.2%" trend="Consistently High" trendType="neutral" />
        <MetricCard label="Avg Approval Time" value="45 sec" trend="-2 mins vs manual" trendType="down_good" />
        <MetricCard label="Avg Dispatch Time" value="1.2 mins" trend="-10 mins vs manual" trendType="down_good" />
        <MetricCard label="Avg Response Time" value="14 mins" trend="-5 mins vs avg" trendType="down_good" />
        <MetricCard label="Total Work Saved" value="1,840 hrs" trend="This Month" trendType="neutral" />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* District-wise Incidents */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">District-wise Incidents</h2>
          <div className="space-y-4 flex-1">
            {districtData.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{d.name}</span>
                  <span>{d.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${d.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disaster Type Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Disaster Type Distribution</h2>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            
            {/* Simple stacked bar for distribution */}
            <div className="w-full h-8 flex rounded-lg overflow-hidden shadow-sm">
              {disasterTypeData.map((d, i) => (
                <div key={i} className={`h-full ${d.color}`} style={{ width: `${d.value}%` }} title={`${d.type}: ${d.value}%`} />
              ))}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-4">
              {disasterTypeData.map((d, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${d.color}`} />
                  <div className="text-xs font-bold text-slate-700">{d.type} <span className="text-slate-400 font-normal">({d.value}%)</span></div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Response Time Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">Response Time Trend (7 Days)</h2>
          <div className="flex-1 flex items-end space-x-2 justify-between mt-4">
            {responseTrend.map((time, i) => {
              const max = 40;
              const height = (time / max) * 100;
              return (
                <div key={i} className="flex flex-col items-center group w-full">
                  <span className="text-[10px] font-bold text-slate-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{time}m</span>
                  <div className="w-full bg-emerald-100 rounded-t-md hover:bg-emerald-200 transition-colors flex items-end justify-center" style={{ height: `${height}px` }}>
                    <div className="w-full bg-emerald-500 rounded-t-sm" style={{ height: `max(4px, ${height * 0.8}px)` }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase">D-{7-i}</span>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4 text-xs font-medium text-slate-500">
            Average response time has decreased by <span className="text-emerald-600 font-bold">65%</span> since Sahaya AI deployment.
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, trendType }: { label: string; value: string; trend: string; trendType: 'up' | 'down_good' | 'neutral' }) {
  const getTrendColor = () => {
    if (trendType === 'down_good') return 'text-emerald-600';
    if (trendType === 'up') return 'text-blue-600';
    return 'text-slate-500';
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-2xl font-black text-slate-900 mb-2">{value}</div>
      <div className={`text-[10px] font-bold uppercase tracking-wider ${getTrendColor()}`}>
        {trend}
      </div>
    </div>
  );
}
