import React, { useState, useEffect } from "react";
import { Shield, Battery, Laptop, Volume2, VolumeX, Camera, Lock, RefreshCw, Cpu } from "lucide-react";
import html2canvas from "html2canvas";

interface SystemControlProps {
  onTriggerLock: () => void;
  onRestartSystem: () => void;
  systemVolume: number;
  onVolumeChange: (vol: number) => void;
  addLog: (text: string, type: "info" | "warning" | "success" | "command") => void;
}

export default function SystemControlWidget({
  onTriggerLock,
  onRestartSystem,
  systemVolume,
  onVolumeChange,
  addLog
}: SystemControlProps) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean>(false);
  const [publicIp, setPublicIp] = useState<string>("Loading...");
  const [memoryUsage, setMemoryUsage] = useState<{ used: string; limit: string; pct: number } | null>(null);
  const [simulatedCpu, setSimulatedCpu] = useState<number>(12);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);

  // Read Battery API
  useEffect(() => {
    if (typeof navigator !== "undefined" && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((batt: any) => {
        setBatteryLevel(Math.round(batt.level * 100));
        setBatteryCharging(batt.charging);

        batt.onlevelchange = () => setBatteryLevel(Math.round(batt.level * 100));
        batt.onchargingchange = () => setBatteryCharging(batt.charging);
      });
    } else {
      // Fallback
      setBatteryLevel(87);
      setBatteryCharging(true);
    }
  }, []);

  // Fetch real IP
  const fetchIpAddress = async () => {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setPublicIp(data.ip || "127.0.0.1");
    } catch (e) {
      setPublicIp("Offline (LAN only)");
    }
  };

  useEffect(() => {
    fetchIpAddress();
  }, []);

  // Read JS memory limits & simulate CPU ripples
  useEffect(() => {
    const interval = setInterval(() => {
      // CPU fluctuations
      setSimulatedCpu(Math.floor(Math.random() * 15) + 8);

      // Memory usage if available (Chrome specific)
      const perf = (performance as any).memory;
      if (perf) {
        const used = (perf.usedJSHeapSize / 1048576).toFixed(1);
        const limit = (perf.jsHeapSizeLimit / 1048576).toFixed(1);
        const pct = Math.round((perf.usedJSHeapSize / perf.jsHeapSizeLimit) * 100);
        setMemoryUsage({ used, limit, pct });
      } else {
        setMemoryUsage({
          used: "42.5",
          limit: "512.0",
          pct: 8,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Capture real Screenshot of the browser app
  const triggerScreenshot = async () => {
    setCapturing(true);
    addLog("System diagnostic screenshot requested. Initializing capture...", "info");
    try {
      const targetElement = document.getElementById("root");
      if (targetElement) {
        // Render html element to canvas
        const canvas = await html2canvas(targetElement, {
          backgroundColor: "#070b13",
          scale: 1,
          logging: false,
        });
        const imgData = canvas.toDataURL("image/png");
        setScreenshots((prev) => [imgData, ...prev.slice(0, 3)]);
        
        // Auto download helper
        const link = document.createElement("a");
        link.download = `jarvis_screenshot_${Date.now()}.png`;
        link.href = imgData;
        link.click();

        addLog("Mainframe screenshot captured and exported.", "success");
      }
    } catch (err: any) {
      console.error("Screenshot capture failure:", err);
      addLog("Screenshot capture failed. Check browser graphics context.", "warning");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div id="jarvis-system-control" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      
      {/* Title Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
        <Laptop className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          Core System Diagnostics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Statistics and sliders */}
        <div className="space-y-3 bg-slate-900/20 border border-slate-900/60 p-3 rounded-lg">
          <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
            INTELLIGENT POWER & PERFORMANCE
          </h4>

          {/* Battery Status */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center">
              <Battery className="w-4 h-4 text-cyan-400 mr-2" />
              Power Cells
            </span>
            <span className={`font-bold ${batteryCharging ? "text-emerald-400" : "text-cyan-400"}`}>
              {batteryLevel !== null ? `${batteryLevel}%` : "Calculating..."} 
              {batteryCharging && " [Charging]"}
            </span>
          </div>

          {/* Battery Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${batteryCharging ? "bg-emerald-500" : "bg-cyan-500"}`}
              style={{ width: `${batteryLevel ?? 80}%` }}
            />
          </div>

          {/* CPU Stats */}
          <div className="flex items-center justify-between text-xs font-mono mt-2">
            <span className="text-slate-400 flex items-center">
              <Cpu className="w-4 h-4 text-violet-400 mr-2" />
              Mainframe CPU Load
            </span>
            <span className="font-bold text-violet-400">
              {simulatedCpu}% (Active)
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${simulatedCpu}%` }}
            />
          </div>

          {/* Memory limit (Heap) */}
          {memoryUsage && (
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
              <span>Heap Allocated: {memoryUsage.used}MB</span>
              <span>Capacity: {memoryUsage.limit}MB</span>
            </div>
          )}

          {/* Sound volume slider */}
          <div className="pt-2 border-t border-slate-900 mt-2 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center">
                {systemVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400 mr-2" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400 mr-2" />
                )}
                Acoustic Speech Volume
              </span>
              <span className="font-bold text-cyan-400">{Math.round(systemVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={systemVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* System control commands */}
        <div className="space-y-3 bg-slate-900/20 border border-slate-900/60 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              MAIN INTERRUPTS
            </h4>
            
            <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-black/30 p-2.5 rounded border border-slate-950 mb-3">
              <div><span className="text-slate-500">Public IP Address:</span> <span className="text-cyan-400 font-bold">{publicIp}</span></div>
              <div><span className="text-slate-500">Local Domain:</span> localhost:3000</div>
              <div><span className="text-slate-500">Stark Firewall:</span> Level 5 Active</div>
            </div>
          </div>

          {/* Core system buttons */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={triggerScreenshot}
              disabled={capturing}
              className="py-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{capturing ? "CAPTURING" : "SCREENSHOT"}</span>
            </button>
            <button
              onClick={onTriggerLock}
              className="py-2.5 rounded bg-amber-950/30 hover:bg-amber-900/40 border border-amber-900/40 text-amber-400 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>LOCK SYSTEM</span>
            </button>
            <button
              onClick={onRestartSystem}
              className="py-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 col-span-2 hover:text-red-400 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REBOOT MAINFRAME MODULES</span>
            </button>
          </div>
        </div>

      </div>

      {/* Captured screenshots strip */}
      {screenshots.length > 0 && (
        <div className="border-t border-slate-900 pt-3">
          <h5 className="text-[9px] font-mono text-slate-500 uppercase mb-2">
            Local Gallery (Click thumbnail to download)
          </h5>
          <div className="flex space-x-2">
            {screenshots.map((src, i) => (
              <a
                key={i}
                href={src}
                download={`jarvis_capture_${i + 1}.png`}
                className="relative w-16 h-10 border border-slate-800 rounded overflow-hidden hover:border-cyan-500/50 transition-all block group"
              >
                <img src={src} alt="System screen snapshot" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-cyan-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[8px] font-mono text-cyan-300">GET</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
