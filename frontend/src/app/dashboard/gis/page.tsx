"use client";

export default function GISIntelligencePage() {
  return (
    <div className="h-full flex flex-col font-mono text-white bg-black">
      {/* HEADER */}
      <div className="shrink-0 p-4 border-b border-slate-800 bg-black flex justify-between items-center">
        <div>
          <div className="text-xl font-bold tracking-widest text-white">GIS_INTELLIGENCE</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">GEOSPATIAL TERRAIN & WEATHER RADAR</div>
        </div>
        <div className="flex space-x-2">
           <button className="px-3 py-1 bg-black border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-900">[ RADAR_ON ]</button>
           <button className="px-3 py-1 bg-black border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-900">[ INFRA_ON ]</button>
           <button className="px-3 py-1 bg-indigo-950 border border-indigo-900 text-indigo-400 text-xs font-bold animate-pulse">[ AI_FLOOD_PREDICT_ON ]</button>
        </div>
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {/* MASSIVE GIS MAP MOCK */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Flood Polygon Mock */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 border border-indigo-500/50 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-[30%] left-[30%] text-indigo-400 font-bold text-sm tracking-widest">
          PROJECTED_INUNDATION_ZONE (T+12H)
        </div>

        {/* Satellite Overlay Info */}
        <div className="absolute top-4 left-4 p-4 border border-slate-800 bg-black/80 backdrop-blur-sm space-y-4 w-64 z-10">
          <div className="text-xs text-slate-500 font-bold tracking-widest border-b border-slate-800 pb-2">LAYERS_ACTIVE</div>
          <div className="flex items-center space-x-2 text-xs">
             <div className="w-2 h-2 bg-emerald-500" />
             <span className="text-slate-300">TOPOGRAPHY_ISRO</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
             <div className="w-2 h-2 bg-red-500" />
             <span className="text-slate-300">IMD_DOPPLER_RADAR</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
             <div className="w-2 h-2 bg-indigo-500 animate-pulse" />
             <span className="text-white font-bold">NVIDIA_AI_PREDICTION</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 p-4 border border-slate-800 bg-black/80 backdrop-blur-sm z-10">
          <div className="text-[10px] text-slate-500 font-bold tracking-widest mb-2 border-b border-slate-800 pb-2">TERRAIN_RISK</div>
          <div className="flex items-center space-x-2 text-[9px]">
             <div className="w-4 h-2 bg-red-900 border border-red-500" />
             <span className="text-slate-300">EXTREME_RISK (&gt;2m WATER)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
