"use client";

export default function SystemHealthPage() {
  return (
    <div className="h-full flex flex-col font-mono text-white bg-black">
      {/* HEADER */}
      <div className="shrink-0 p-4 border-b border-slate-800 bg-black flex justify-between items-center">
        <div>
          <div className="text-xl font-bold tracking-widest text-white">SYSTEM_HEALTH</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">INFRASTRUCTURE STATUS & UPTIME</div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-2">
             <span className="text-[10px] text-slate-400 font-bold">GLOBAL_STATUS:</span>
             <span className="px-3 py-1 bg-emerald-950 border border-emerald-900 text-emerald-500 text-xs font-bold animate-pulse">OPTIMAL</span>
           </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* CORE SERVICES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-slate-800 bg-black p-4 space-y-3">
             <div className="text-[10px] text-slate-500 font-bold tracking-widest">API_GATEWAY</div>
             <div className="flex justify-between items-center">
               <span className="text-2xl font-bold text-white">99.99%</span>
               <span className="text-emerald-500 text-xs font-bold">ONLINE</span>
             </div>
             <div className="h-1 bg-slate-900"><div className="h-full bg-emerald-500 w-full" /></div>
          </div>

          <div className="border border-slate-800 bg-black p-4 space-y-3">
             <div className="text-[10px] text-slate-500 font-bold tracking-widest">POSTGRESQL_DB</div>
             <div className="flex justify-between items-center">
               <span className="text-2xl font-bold text-white">12ms</span>
               <span className="text-emerald-500 text-xs font-bold">ONLINE</span>
             </div>
             <div className="h-1 bg-slate-900"><div className="h-full bg-emerald-500 w-[95%]" /></div>
          </div>

          <div className="border border-slate-800 bg-black p-4 space-y-3">
             <div className="text-[10px] text-slate-500 font-bold tracking-widest">NVIDIA_NIM_MODELS</div>
             <div className="flex justify-between items-center">
               <span className="text-2xl font-bold text-white">412 T/s</span>
               <span className="text-emerald-500 text-xs font-bold">ONLINE</span>
             </div>
             <div className="h-1 bg-slate-900"><div className="h-full bg-emerald-500 w-[80%]" /></div>
          </div>

          <div className="border border-slate-800 bg-black p-4 space-y-3 border-amber-900">
             <div className="text-[10px] text-slate-500 font-bold tracking-widest">IMD_WX_API (EXTERNAL)</div>
             <div className="flex justify-between items-center">
               <span className="text-2xl font-bold text-white">450ms</span>
               <span className="text-amber-500 text-xs font-bold animate-pulse">DEGRADED</span>
             </div>
             <div className="h-1 bg-slate-900"><div className="h-full bg-amber-500 w-[40%]" /></div>
          </div>
        </div>

        {/* SERVER TERMINAL MOCK */}
        <div className="border border-slate-800 bg-black flex flex-col h-64">
           <div className="p-2 border-b border-slate-800 bg-slate-900 text-[10px] text-slate-500 font-bold tracking-widest flex justify-between">
              <span>SERVER_SYSLOG</span>
              <span>NODE: SEOC-OD-01</span>
           </div>
           <div className="flex-1 p-4 overflow-y-auto text-[10px] text-slate-400 space-y-1">
              <div>[14:22:01] INFO  main - System booted up securely.</div>
              <div>[14:22:05] INFO  db - Connected to cluster eu-west-1.</div>
              <div>[14:23:14] WARN  api - High latency detected on /weather route.</div>
              <div>[14:24:00] INFO  nim - Model loaded into VRAM (24GB/80GB).</div>
              <div className="text-white animate-pulse">root@sahaya-os:~# _</div>
           </div>
        </div>

      </div>
    </div>
  );
}
