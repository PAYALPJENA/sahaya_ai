"use client";

export default function AIDecisionSupportPage() {
  return (
    <div className="h-full flex flex-col font-mono text-white bg-black">
      {/* HEADER */}
      <div className="shrink-0 p-4 border-b border-slate-800 bg-black flex justify-between items-center">
        <div>
          <div className="text-xl font-bold tracking-widest text-white">AI_DECISION_SUPPORT</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">NEURAL TACTICAL ASSISTANT</div>
        </div>
        <div className="px-3 py-1 bg-purple-950 border border-purple-900 text-purple-400 text-xs font-bold animate-pulse">
          NVIDIA NIM ONLINE
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 min-h-0">
        
        {/* LEFT: MODEL TELEMETRY */}
        <div className="col-span-3 border-r border-slate-800 flex flex-col bg-slate-950 min-h-0 p-4 space-y-6">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">ACTIVE_MODELS</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-white">Llama 3 (70B)</span><span className="text-emerald-500">22ms</span></div>
                <div className="text-[9px] text-slate-500">NLP / ENTITY EXTRACTION</div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-white">Mistral NeMo</span><span className="text-emerald-500">18ms</span></div>
                <div className="text-[9px] text-slate-500">TRIAGE / LOGIC ROUTING</div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-white">Deplot (Vision)</span><span className="text-emerald-500">45ms</span></div>
                <div className="text-[9px] text-slate-500">DRONE/SATELLITE IMAGE ANALYSIS</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">THROUGHPUT</div>
            <div className="text-4xl font-black text-white">412</div>
            <div className="text-xs text-slate-400 mt-1">TOKENS / SEC (AVG)</div>
          </div>
        </div>

        {/* RIGHT: LIVE AI FEED & OVERSIGHT */}
        <div className="col-span-9 flex flex-col bg-black min-h-0">
          <div className="p-2 border-b border-slate-800 bg-slate-900 text-[10px] text-slate-500 font-bold uppercase tracking-widest flex justify-between">
            <span>REAL_TIME_TRIAGE_FEED</span>
            <span>AUTO-SCROLL: ON</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
            {/* Live Feed Mocks */}
            <div className="border border-purple-900 bg-purple-950/10 p-4 space-y-3">
              <div className="flex justify-between items-start text-xs border-b border-purple-900/50 pb-2">
                <span className="text-purple-400 font-bold">EVENT: AUDIO_PROCESSING_COMPLETE</span>
                <span className="text-slate-500">INCIDENT-884</span>
              </div>
              <div className="text-slate-300 text-xs leading-relaxed">
                <span className="text-slate-500 mr-2">INPUT:</span> "My house is flooded near the temple, we need help!" <br/>
                <span className="text-slate-500 mr-2">EXTRACTION:</span> `disaster="Flood"`, `location="Temple (Proximity)"`, `urgency="High"` <br/>
                <span className="text-slate-500 mr-2">CONFIDENCE:</span> 98.4%
              </div>
            </div>
            
            <div className="border border-purple-900 bg-purple-950/10 p-4 space-y-3">
              <div className="flex justify-between items-start text-xs border-b border-purple-900/50 pb-2">
                <span className="text-purple-400 font-bold">EVENT: RESOURCE_RECOMMENDATION_GENERATED</span>
                <span className="text-slate-500">INCIDENT-884</span>
              </div>
              <div className="text-slate-300 text-xs leading-relaxed">
                <span className="text-emerald-500 font-bold">&gt; AI PROPOSAL:</span> Dispatch NDRF_TEAM_3 (BOAT). ETA 14 mins.
                <br/><span className="text-slate-500 mr-2">RATIONALE:</span> Closest waterborne unit. Capable of deep-water extraction.
              </div>
            </div>
            
            {/* Blinking Cursor */}
            <div className="text-purple-500 animate-pulse text-lg">_</div>
          </div>
        </div>

      </div>
    </div>
  );
}
