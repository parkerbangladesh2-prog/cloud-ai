import React, { useEffect, useState } from "react";
import { Mic, MicOff, Sparkles, Volume2, Shield, Activity, RefreshCw } from "lucide-react";

interface ArcReactorProps {
  status: "online" | "listening" | "speaking" | "thinking" | "sleeping";
  onClick: () => void;
}

export default function ArcReactor({ status, onClick }: ArcReactorProps) {
  // Direct path of the generated JARVIS neural core image
  const jarvisCoreImg = "/src/assets/images/jarvis_neural_core_1784110030555.jpg";

  // Dynamic holographic telemetry stats
  const [synapseStrength, setSynapseStrength] = useState(98.4);
  const [frequency, setFrequency] = useState(482.6);
  const [bufferStatus, setBufferStatus] = useState("SECURE");

  // Telemetry fluctuation simulation
  useEffect(() => {
    if (status === "sleeping") return;
    
    const interval = setInterval(() => {
      setSynapseStrength(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.min(100, Math.max(92, prev + delta)).toFixed(1));
      });
      setFrequency(prev => {
        const delta = (Math.random() - 0.5) * 5.0;
        return parseFloat(Math.min(520, Math.max(440, prev + delta)).toFixed(1));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [status]);

  // Audio waveform height helper for voice command visualizer
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>([15, 25, 40, 30, 50, 60, 45, 30, 20, 10]);

  useEffect(() => {
    if (status !== "listening" && status !== "speaking" && status !== "thinking") {
      setWaveAmplitudes([6, 8, 5, 7, 6, 8, 5, 7, 6, 5]);
      return;
    }

    const interval = setInterval(() => {
      setWaveAmplitudes(prev => 
        prev.map(() => {
          const min = status === "listening" ? 25 : status === "thinking" ? 15 : 35;
          const max = status === "listening" ? 85 : status === "thinking" ? 45 : 95;
          return Math.floor(Math.random() * (max - min) + min);
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [status]);

  // Styling based on state
  let statusColor = "text-cyan-400";
  let ringColor = "border-cyan-500/30";
  let glowColor = "shadow-[0_0_25px_rgba(6,182,212,0.6)]";
  let overlayColor = "bg-cyan-500/10";
  let statusText = "System Core Online";
  let subText = "Click Core or Press Space to speak";

  switch (status) {
    case "listening":
      statusColor = "text-emerald-400";
      ringColor = "border-emerald-500/60";
      glowColor = "shadow-[0_0_40px_rgba(16,185,129,0.9)]";
      overlayColor = "bg-emerald-500/20";
      statusText = "Acoustic Stream Active";
      subText = "Live-deciphering vocal matrix...";
      break;
    case "speaking":
      statusColor = "text-sky-400";
      ringColor = "border-sky-500/60";
      glowColor = "shadow-[0_0_35px_rgba(14,165,233,0.8)]";
      overlayColor = "bg-sky-500/15";
      statusText = "Audio Synthesis Active";
      subText = "Transmitting response frequency...";
      break;
    case "thinking":
      statusColor = "text-violet-400";
      ringColor = "border-violet-500/60";
      glowColor = "shadow-[0_0_35px_rgba(139,92,246,0.8)]";
      overlayColor = "bg-violet-500/20";
      statusText = "Neural Synaptic Search";
      subText = "Resolving cognitive directive...";
      break;
    case "sleeping":
      statusColor = "text-slate-500";
      ringColor = "border-slate-800";
      glowColor = "shadow-none";
      overlayColor = "bg-black/60 grayscale";
      statusText = "Standby Protocol Locked";
      subText = "Core offline. Tap to activate.";
      break;
    case "online":
    default:
      statusColor = "text-cyan-400";
      ringColor = "border-cyan-500/30";
      glowColor = "shadow-[0_0_25px_rgba(6,182,212,0.5)]";
      overlayColor = "bg-transparent";
      statusText = "Mainframe Synced";
      subText = "Ready for voice instruction, Sir.";
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full max-w-sm mx-auto">
      {/* Telemetry Lateral Metrics */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase tracking-widest px-4 mb-4 select-none">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-cyan-500 animate-pulse" />
            <span>CORE_FRQ:</span>
            <span className="text-slate-300 font-bold">{status === "sleeping" ? "0.0" : `${frequency} GHz`}</span>
          </div>
          <div>INTEGRITY: <span className="text-cyan-400 font-bold">{status === "sleeping" ? "0.0%" : "100%"}</span></div>
        </div>
        <div className="flex flex-col space-y-1 text-right">
          <div>SYNAPSE: <span className="text-emerald-400 font-bold">{status === "sleeping" ? "0.0" : `${synapseStrength}%`}</span></div>
          <div className="flex items-center justify-end space-x-1">
            <span>BUFFER:</span>
            <span className={`${status === "sleeping" ? "text-slate-600" : "text-emerald-400"} font-bold`}>{status === "sleeping" ? "STANDBY" : bufferStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Reactor Orb Core */}
      <div className="relative group cursor-pointer" onClick={onClick}>
        {/* Ambient Halo Radial Glow */}
        <div 
          className={`absolute -inset-6 rounded-full transition-all duration-700 opacity-65 ${glowColor} ${
            status === "sleeping" ? "opacity-0" : "opacity-40 blur-xl animate-[pulse_3s_ease-in-out_infinite]"
          }`} 
        />

        {/* Dynamic Pulsing Radial Ping Waves */}
        {(status === "listening" || status === "speaking") && (
          <>
            <div className={`absolute -inset-6 rounded-full border border-current opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] ${statusColor}`} />
            <div className={`absolute -inset-12 rounded-full border border-current opacity-20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] ${statusColor}`} />
          </>
        )}

        {/* Segmented Outer Rotation HUD ring */}
        <div
          className={`w-44 h-44 rounded-full border-4 border-double border-spacing-2 transition-all duration-700 flex items-center justify-center ${ringColor} ${
            status === "listening" 
              ? "animate-[spin_4s_linear_infinite]" 
              : status === "thinking" 
              ? "animate-[spin_1.5s_linear_infinite]" 
              : status === "speaking" 
              ? "animate-[spin_7s_linear_infinite]" 
              : status === "sleeping" 
              ? "" 
              : "animate-[spin_15s_linear_infinite]"
          }`}
        >
          {/* Dash segmented subring inside */}
          <div className="w-[164px] h-[164px] rounded-full border border-dashed border-cyan-500/20" />
        </div>

        {/* Diagonal high-tech crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-48 h-px bg-cyan-500/40 transform rotate-45" />
          <div className="w-48 h-px bg-cyan-500/40 transform -rotate-45" />
        </div>

        {/* Embedded Actual Image Processing Core of JARVIS (The generated 1:1 asset) */}
        <div
          id="jarvis-core-button"
          className="absolute inset-4 rounded-full overflow-hidden flex items-center justify-center border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-500 hover:scale-[1.03] active:scale-95"
        >
          {/* The actual spectacular AI core graphic */}
          <img
            src={jarvisCoreImg}
            alt="JARVIS Core"
            className={`w-full h-full object-cover transition-all duration-700 select-none pointer-events-none ${
              status === "sleeping" ? "opacity-20 grayscale brightness-50" : "opacity-85 brightness-110"
            }`}
            onError={(e) => {
              // Graceful local aesthetic backup if image path is unavailable
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.classList.add("bg-gradient-to-br", "from-slate-900", "via-cyan-950", "to-slate-900");
              }
            }}
          />

          {/* Glowing color tint filter matching active core status */}
          <div className={`absolute inset-0 transition-colors duration-500 ${overlayColor}`} />

          {/* Active holographic scanning line sweep */}
          {status !== "sleeping" && (
            <div className="absolute inset-x-0 h-1 bg-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-scanner-sweep" />
          )}

          {/* Central Interactive State Icons (overlayed cleanly) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 backdrop-blur-[1px] text-white">
            <div className="p-2.5 rounded-full bg-slate-950/70 border border-slate-800/60 shadow-lg group-hover:scale-110 transition-transform">
              {status === "listening" ? (
                <Mic className="w-7 h-7 text-emerald-400 animate-bounce" />
              ) : status === "speaking" ? (
                <Volume2 className="w-7 h-7 text-sky-400 animate-pulse" />
              ) : status === "thinking" ? (
                <RefreshCw className="w-7 h-7 text-violet-400 animate-spin" />
              ) : status === "sleeping" ? (
                <MicOff className="w-7 h-7 text-slate-500" />
              ) : (
                <Mic className="w-7 h-7 text-cyan-400" />
              )}
            </div>

            <span className="text-[8px] font-mono tracking-widest mt-2 uppercase font-bold text-slate-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] select-none">
              {status === "listening" ? "Listening" : status === "sleeping" ? "Offline" : "SYSTEM CORE"}
            </span>
          </div>
        </div>
      </div>

      {/* Voice-Responsive Waveform Frequency Equalizer */}
      <div className="mt-5 flex items-center justify-center space-x-1 h-12 w-full max-w-[200px] select-none">
        {waveAmplitudes.map((height, index) => (
          <div
            key={index}
            className={`w-1 rounded transition-all duration-150 ${
              status === "listening"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : status === "speaking"
                ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                : status === "thinking"
                ? "bg-violet-500"
                : "bg-slate-800"
            }`}
            style={{
              height: `${height}%`,
            }}
          />
        ))}
      </div>

      {/* Dynamic Literal System State Label */}
      <div className="mt-4 text-center select-none">
        <p className="text-xs text-slate-400 font-mono flex items-center justify-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse text-cyan-400" />
          <span>MATRIX STATUS: </span>
          <span
            className={`font-bold uppercase tracking-widest font-mono text-[11px] ${
              status === "listening"
                ? "text-emerald-400"
                : status === "speaking"
                ? "text-sky-400"
                : status === "thinking"
                ? "text-violet-400"
                : status === "sleeping"
                ? "text-slate-500"
                : "text-cyan-400"
            }`}
          >
            {status}
          </span>
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-1 tracking-wide">
          {subText}
        </p>
      </div>
    </div>
  );
}

