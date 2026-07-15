import React, { useState } from "react";
import { Globe, Search, ExternalLink, Compass } from "lucide-react";

interface WebSitesWidgetProps {
  websites: Record<string, string>;
  onLaunchSite: (site: string, url: string) => void;
}

export default function WebSitesWidget({ websites, onLaunchSite }: WebSitesWidgetProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    window.open(url, "_blank");
    setSearchTerm("");
  };

  return (
    <div id="jarvis-websites-panel" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      {/* Title Header */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
        <Globe className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          Stark Web Navigation Core
        </span>
      </div>

      {/* Embedded Google Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Execute remote search on Google..."
          className="w-full bg-slate-900 border border-slate-850 pl-9 pr-20 py-2 text-xs rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500/40 placeholder-slate-500 font-mono"
        />
        <button
          type="submit"
          className="absolute right-1.5 text-[9px] font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/40 px-2 py-1 rounded transition-all"
        >
          SEARCH
        </button>
      </form>

      {/* Website launch grid */}
      <div className="space-y-2">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-0.5 flex items-center">
          <Compass className="w-3 h-3 mr-1 text-cyan-500 animate-spin-slow" /> Authorized Portals
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
          {Object.entries(websites).map(([site, url]) => (
            <button
              key={site}
              onClick={() => onLaunchSite(site, url)}
              className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-900 hover:border-cyan-800/30 hover:bg-slate-900/80 transition-all cursor-pointer group text-left"
            >
              <span className="text-xs font-mono text-slate-300 group-hover:text-cyan-400 font-semibold capitalize">
                {site}
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
