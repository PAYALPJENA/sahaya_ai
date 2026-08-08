"use client";

export default function AdministrationPage() {
  return (
    <div className="h-full flex flex-col font-mono text-white bg-black">
      {/* HEADER */}
      <div className="shrink-0 p-4 border-b border-slate-800 bg-black flex justify-between items-center">
        <div>
          <div className="text-xl font-bold tracking-widest text-white">ADMINISTRATION</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">USER ROLES & SYSTEM POLICIES</div>
        </div>
        <div className="px-4 py-1 bg-red-950 border border-red-900 text-red-500 text-xs font-bold">
          ROOT_ACCESS_LEVEL
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        
        {/* USERS */}
        <div className="border border-slate-800 bg-slate-950 flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
             <span className="text-xs text-slate-400 font-bold tracking-widest">AUTHORIZED_PERSONNEL</span>
             <button className="px-2 py-1 bg-black border border-slate-700 text-white text-[9px] hover:bg-slate-800">[ ADD_USER ]</button>
          </div>
          <div className="p-4 grid grid-cols-4 gap-4 text-xs">
             <div className="border border-slate-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-start">
                   <div className="font-bold text-white">COLLECTOR_01</div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-500">DISTRICT_MAGISTRATE</div>
                <div className="text-indigo-400 text-[10px] font-bold">ROLE: APPROVER</div>
             </div>
             
             <div className="border border-slate-800 bg-black p-4 space-y-2">
                <div className="flex justify-between items-start">
                   <div className="font-bold text-white">SYS_ADMIN</div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-500">IT_DIRECTOR</div>
                <div className="text-red-400 text-[10px] font-bold">ROLE: ROOT</div>
             </div>
          </div>
        </div>

        {/* POLICIES */}
        <div className="border border-slate-800 bg-slate-950 flex flex-col">
          <div className="p-3 border-b border-slate-800 bg-slate-900">
             <span className="text-xs text-slate-400 font-bold tracking-widest">OPERATIONAL_POLICIES</span>
          </div>
          <div className="p-4 space-y-4 text-xs">
             <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                   <div className="font-bold text-white mb-1">AUTO_DISPATCH_THRESHOLD</div>
                   <div className="text-slate-500 text-[10px]">Severity score required for AI auto-dispatch (bypassing human).</div>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-red-500 font-bold">95 / 100</span>
                   <button className="px-2 py-1 bg-black border border-slate-700 text-white text-[9px]">EDIT</button>
                </div>
             </div>
             <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                   <div className="font-bold text-white mb-1">STRICT_AUDIT_MODE</div>
                   <div className="text-slate-500 text-[10px]">Require digital signatures for all actions.</div>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-emerald-500 font-bold">ENABLED</span>
                   <button className="px-2 py-1 bg-black border border-slate-700 text-white text-[9px]">TOGGLE</button>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
