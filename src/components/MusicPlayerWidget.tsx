import React, { useState, useEffect, useRef } from "react";
import { Music, Play, Pause, SkipForward, Volume2, Disc } from "lucide-react";

interface Track {
  title: string;
  artist: string;
  url: string; // fallback
  type: "ambient" | "rock" | "synth";
}

const PLAYLIST: Track[] = [
  {
    title: "Stark Mainframe Humming Protocol",
    artist: "J.A.R.V.I.S. Ambient",
    url: "ambient",
    type: "ambient"
  },
  {
    title: "Arc Reactor Resonance",
    artist: "Tony Stark Laboratories",
    url: "synth",
    type: "synth"
  },
  {
    title: "Back in Black (Synth Tribute)",
    artist: "Stark Rock Core",
    url: "rock",
    type: "rock"
  }
];

export default function MusicPlayerWidget() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [eqWaves, setEqWaves] = useState<number[]>([15, 25, 10, 35, 15, 45, 20, 30, 15]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const currentTrack = PLAYLIST[currentTrackIdx];

  // Procedural audio synthesis based on track type
  const startProceduralAudio = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Stop any existing oscillator
      stopProceduralAudio();

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Configure based on track theme
      if (currentTrack.type === "ambient") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Deep A hum
        // Add a second vibrato or tremolo frequency ripple
        gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      } else if (currentTrack.type === "synth") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(165, ctx.currentTime); // E3 tone
        gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Rock drone A3
        gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.error("Web Audio Synthesis failed:", e);
    }
  };

  const stopProceduralAudio = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
  };

  // Keep volume synced
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const multiplier = currentTrack.type === "rock" ? 0.25 : currentTrack.type === "synth" ? 0.4 : 0.5;
      gainNodeRef.current.gain.setValueAtTime(volume * multiplier, audioCtxRef.current.currentTime);
    }
  }, [volume, currentTrack.type]);

  // Dynamic visualizer animations
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (isPlaying) {
        setEqWaves((prev) =>
          prev.map(() => {
            const minVal = 5;
            const maxVal = 50;
            const diff = Math.random() * 20 - 10;
            return Math.max(minVal, Math.min(maxVal, prev[Math.floor(Math.random() * prev.length)] + diff));
          })
        );
      } else {
        setEqWaves([5, 5, 5, 5, 5, 5, 5, 5, 5]);
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Handle play toggle
  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      startProceduralAudio();
    } else {
      setIsPlaying(false);
      stopProceduralAudio();
    }
  };

  // Handle skips
  const skipTrack = () => {
    const nextIdx = (currentTrackIdx + 1) % PLAYLIST.length;
    setCurrentTrackIdx(nextIdx);
    if (isPlaying) {
      // Re-trigger synthesis on next tick with new settings
      setTimeout(() => {
        startProceduralAudio();
      }, 50);
    }
  };

  // Stop synthesis on component unmount
  useEffect(() => {
    return () => {
      stopProceduralAudio();
    };
  }, []);

  return (
    <div id="jarvis-music-module" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
        <Music className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          Audio & Acoustics Core
        </span>
      </div>

      <div className="flex items-center space-x-4 bg-slate-900/30 border border-slate-905 p-3 rounded-lg">
        {/* Album Artwork rotating Disc */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center shadow-lg">
            <Disc className={`w-8 h-8 text-cyan-400 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
          </div>
          <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-slate-950 border border-slate-800" />
        </div>

        {/* Current Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-100 truncate">{currentTrack.title}</h4>
          <p className="text-[10px] font-mono text-cyan-400/80 truncate">{currentTrack.artist}</p>
          <span className="inline-block text-[8px] font-mono border border-cyan-900/40 bg-cyan-950/40 text-cyan-300 px-1.5 py-0.5 rounded uppercase mt-1">
            Procedural Synthesizer
          </span>
        </div>
      </div>

      {/* Visual Equalizer Grid */}
      <div className="h-10 bg-slate-950/50 rounded border border-slate-900 flex items-end justify-center space-x-1 px-4 py-2">
        {eqWaves.map((h, i) => (
          <div
            key={i}
            className="w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-100"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Play/Pause/Skip */}
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-800/40 hover:bg-cyan-900 text-cyan-400 flex items-center justify-center transition-all active:scale-95 shadow-inner"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={skipTrack}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-all active:scale-95 border border-slate-800"
            title="Next mainframe wave frequency"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Local music volume */}
        <div className="flex items-center space-x-2 w-1/2">
          <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 h-1"
          />
        </div>
      </div>
    </div>
  );
}
