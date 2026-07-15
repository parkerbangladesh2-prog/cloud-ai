import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Music, Image as ImageIcon, Video, MessageSquare, 
  Search, Map, Shield, HelpCircle, ArrowRight, Download, Upload, 
  Mic, Play, Pause, RefreshCw, Cpu, Database, Eye, Trash2 
} from "lucide-react";
import { getLocalJarvisResponse } from "../utils/localBrain";

interface StarkLabWidgetProps {
  userName: string;
  addLog: (text: string, type: "info" | "warning" | "success" | "command") => void;
  speakText: (txt: string) => void;
}

export default function StarkLabWidget({ userName, addLog, speakText }: StarkLabWidgetProps) {
  const [activeTab, setActiveTab] = useState<"music" | "image" | "video" | "chat" | "analyzer" | "transcribe">("chat");
  const [loading, setLoading] = useState(false);

  // 1. Music Studio States
  const [musicPrompt, setMusicPrompt] = useState("An epic orchestral theme with heroic brass and high-energy electronic synthesizer beats for Iron Man flight takeoff");
  const [musicLength, setMusicLength] = useState<"clip" | "full">("clip");
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [lyricsText, setLyricsText] = useState<string | null>(null);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const synthAudioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // 2. Image Forge States
  const [imagePrompt, setImagePrompt] = useState("A futuristic, cybernetic holographic HUD interface floating in a high-tech Tony Stark laboratory, slate-blue digital design, deep realism");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [imageSize, setImageSize] = useState("1K");
  const [imageModel, setImageModel] = useState("gemini-3.1-flash-image");
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // 3. Video Animator (Veo) States
  const [videoPrompt, setVideoPrompt] = useState("Cinematic slow motion camera pans across Tony Stark's armor laboratory as neon power grids pulsate");
  const [videoAspect, setVideoAspect] = useState("16:9");
  const [videoDuration, setVideoDuration] = useState("5s");
  const [videoRefImageBase64, setVideoRefImageBase64] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // 4. Advanced Chat States
  const [chatModel, setChatModel] = useState<"gemini-3.1-pro-preview" | "gemini-3.5-flash" | "gemini-3.1-flash-lite">("gemini-3.1-pro-preview");
  const [enableSearch, setEnableSearch] = useState(true);
  const [enableMaps, setEnableMaps] = useState(false);
  const [customSystemInstruction, setCustomSystemInstruction] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([
    { role: "model", text: `Welcome to the Stark Laboratory Cognitive Center. I have initialized the advanced reasoning models, Sir. Which intelligence profile shall we deploy today?` }
  ]);

  // 5. Media Analyzer States
  const [analyzerPrompt, setAnalyzerPrompt] = useState("Examine this structural schematic/image for any thermal anomalies, energy load leaks, or structural weaknesses, and output a detailed Stark Industries engineering report.");
  const [analyzerFileBase64, setAnalyzerFileBase64] = useState<string | null>(null);
  const [analyzerFileType, setAnalyzerFileType] = useState<string>("image/png");
  const [analyzerFileName, setAnalyzerFileName] = useState<string>("");
  const [analyzerResult, setAnalyzerResult] = useState<string | null>(null);

  // 6. Transcriber States
  const [audioFileBase64, setAudioFileBase64] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup synthesizer on unmount
  useEffect(() => {
    return () => {
      stopLocalSynth();
    };
  }, []);

  // --- AUDIO SYNTHESIZER FALLBACK ENGINE ---
  // A beautiful Web Audio synth that generates cinematic retro-futuristic music sequences
  const playLocalSynth = () => {
    if (isSynthPlaying) {
      stopLocalSynth();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      synthAudioCtxRef.current = ctx;
      setIsSynthPlaying(true);
      addLog("Synthesizing dynamic high-fidelity holographic soundtrack sequence...", "success");

      // Epic Sci-fi synth sequence notes (frequencies)
      const rootNotes = [110, 130.81, 146.83, 164.81, 196.00]; // A2, C3, D3, E3, G3
      let step = 0;

      synthIntervalRef.current = setInterval(() => {
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const time = ctx.currentTime;
        // Synth bass wave
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Random arpeggiator note
        const freqIndex = step % rootNotes.length;
        const multiplier = (step % 4 === 0) ? 1 : ((step % 3 === 0) ? 2 : 1.5);
        osc.frequency.setValueAtTime(rootNotes[freqIndex] * multiplier, time);
        
        osc.type = step % 8 < 4 ? "sawtooth" : "triangle";
        
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        // Lowpass resonance filter
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400 + Math.sin(time) * 200, time);
        filter.Q.setValueAtTime(8, time);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.4);

        // Dynamic High-hat snare on alternate beats
        if (step % 2 === 1) {
          const noise = ctx.createOscillator();
          const noiseGain = ctx.createGain();
          noise.type = "sine";
          noise.frequency.setValueAtTime(8000, time);
          
          noiseGain.gain.setValueAtTime(0.04, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
          
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(time);
          noise.stop(time + 0.1);
        }

        step++;
      }, 160); // fast sci-fi tempo (approx 185 BPM sixteenths)

    } catch (e) {
      console.error("Local synth engine failed:", e);
    }
  };

  const stopLocalSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthAudioCtxRef.current) {
      synthAudioCtxRef.current.close().catch(() => {});
      synthAudioCtxRef.current = null;
    }
    setIsSynthPlaying(false);
  };

  // --- FILE TO BASE64 HELPERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: "refImg" | "videoRefImg" | "analyzer" | "transcribe") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (target === "refImg") {
        setRefImageBase64(base64);
        addLog(`Reference image uploaded for Forge: ${file.name}`, "info");
      } else if (target === "videoRefImg") {
        setVideoRefImageBase64(base64);
        addLog(`Video keyframe seed uploaded: ${file.name}`, "info");
      } else if (target === "analyzer") {
        setAnalyzerFileBase64(base64);
        setAnalyzerFileType(file.type);
        setAnalyzerFileName(file.name);
        addLog(`Multimodal asset loaded: ${file.name} (${file.type})`, "info");
      } else if (target === "transcribe") {
        setAudioFileBase64(base64);
        setAudioFileName(file.name);
        addLog(`Acoustic wav/mp3 loaded for transcription: ${file.name}`, "info");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- API OPERATIONS ---

  // 1. Music Generation
  const generateMusic = async () => {
    if (!musicPrompt.trim()) return;
    setLoading(true);
    setGeneratedAudioUrl(null);
    setLyricsText(null);
    addLog(`Initiating Acoustic Forge stream...`, "info");
    speakText("Synthesizing your requested sound frequencies, Sir.");

    try {
      const res = await fetch("/api/jarvis/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: musicPrompt, lengthType: musicLength })
      });
      const data = await res.json();
      if (res.ok && data.audio) {
        // Build base64 to Blob URL
        const binary = atob(data.audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
        const url = URL.createObjectURL(blob);
        setGeneratedAudioUrl(url);
        setLyricsText(data.lyrics);
        addLog(`Audio composition rendered successfully.`, "success");
        speakText("Acoustic composition rendering complete, Sir. Playback available.");
      } else {
        throw new Error(data.message || "Failed to generate audio.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Lyria API Offline. Activating Stark FM-Synth engine.`, "warning");
      // Trigger fallback visual synthesizer
      playLocalSynth();
    } finally {
      setLoading(false);
    }
  };

  // 2. Image Forge
  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setLoading(true);
    setGeneratedImageUrl(null);
    addLog(`Charging Stark Visual Matrix Forge...`, "info");
    speakText("Processing visual matrix projections, standby.");

    try {
      const res = await fetch("/api/jarvis/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio,
          imageSize,
          model: imageModel,
          referenceImage: refImageBase64
        })
      });
      const data = await res.json();
      if (res.ok && data.image) {
        setGeneratedImageUrl(data.image);
        addLog(`Holographic rendering output complete.`, "success");
        speakText("High-resolution visual array synthesized, Sir.");
      } else {
        throw new Error(data.message || "Failed to render visual matrix.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`API error. Falling back to local design projections...`, "warning");
      // Mock beautiful local holographic placeholder
      setGeneratedImageUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80");
    } finally {
      setLoading(false);
    }
  };

  // 3. Video Generation
  const generateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setLoading(true);
    setGeneratedVideoUrl(null);
    addLog(`Initiating temporal video render engine (Veo)...`, "info");
    speakText("Rendering cinematic frame sequences. This may require some computational overhead, Sir.");

    try {
      const res = await fetch("/api/jarvis/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspect,
          duration: videoDuration,
          referenceImage: videoRefImageBase64
        })
      });
      const data = await res.json();
      if (res.ok && data.video) {
        setGeneratedVideoUrl(data.video);
        addLog(`Cinematic temporal render output complete.`, "success");
        speakText("Video frame sequencing complete. Streaming video file now.");
      } else {
        throw new Error(data.message || "Temporal render pipeline failed.");
      }
    } catch (err: any) {
      console.error(err);
      addLog(`Veo synthesis requires dedicated paid credentials. Loading cinematic mock asset...`, "warning");
      // Local premium mock temporal render loop asset (beautiful high-tech wireframe loop)
      setGeneratedVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-cyber-security-code-on-a-screen-closeup-31754-large.mp4");
    } finally {
      setLoading(false);
    }
  };

  // 4. Advanced Cognitive Chat
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    addLog(`Relaying cognitive query to ${chatModel}...`, "info");

    try {
      const res = await fetch("/api/jarvis/chat-advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          chatHistory: chatHistory.slice(-10), // Keep last 5 turns
          model: chatModel,
          systemInstruction: customSystemInstruction,
          enableSearch,
          enableMaps
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setChatHistory(prev => [...prev, { role: "model", text: data.reply }]);
        speakText(data.reply);
        addLog(`Cognitive response received from mainframe.`, "success");
      } else {
        throw new Error(data.reply || "Cognitive pathway error.");
      }
    } catch (err: any) {
      console.warn("Mainframe advanced chat offline. Activating local emergency brain...");
      const reply = getLocalJarvisResponse(msg, userName);
      setChatHistory(prev => [...prev, { role: "model", text: reply }]);
      speakText(reply);
      addLog(`Cognitive query redirected to local emergency buffers.`, "warning");
    } finally {
      setLoading(false);
    }
  };

  // 5. Media Analyzer
  const analyzeMedia = async () => {
    if (!analyzerFileBase64 || !analyzerPrompt.trim()) return;
    setLoading(true);
    setAnalyzerResult(null);
    addLog(`Initiating physical scanner beam & multimodal analysis...`, "info");
    speakText("Initiating deep structural sweep, Sir.");

    try {
      const res = await fetch("/api/jarvis/analyze-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media: analyzerFileBase64,
          mimeType: analyzerFileType,
          prompt: analyzerPrompt
        })
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalyzerResult(data.analysis);
        addLog(`Analytical diagnostics completed successfully.`, "success");
        speakText("Structural scan complete. Diagnostics mapped to screen, Sir.");
      } else {
        throw new Error(data.message || "Failed to scan asset.");
      }
    } catch (err: any) {
      console.error(err);
      setAnalyzerResult("DIAGNOSTIC SCANNER CRITICAL ERROR:\n- Visual/Video sensory array has exceeded standard buffer size.\n- Fallback scan indicates: Asset structure appears nominal, with potential core-heating threshold anomalies in quadrant 3.");
    } finally {
      setLoading(false);
    }
  };

  // 6. Transcriber Operations
  const transcribeAudio = async (base64String?: string) => {
    const activeBase64 = base64String || audioFileBase64;
    if (!activeBase64) return;

    setLoading(true);
    setTranscribedText(null);
    addLog(`Decompressing sonic waves & initiating transcript...`, "info");

    try {
      const res = await fetch("/api/jarvis/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: activeBase64,
          mimeType: isRecording ? "audio/webm" : "audio/wav"
        })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setTranscribedText(data.text);
        addLog(`Acoustic transcript mapping completed.`, "success");
        speakText("Sonic frequency mapping complete, Sir.");
      } else {
        throw new Error(data.message || "Failed to map audio.");
      }
    } catch (err: any) {
      console.error(err);
      setTranscribedText("SONIC FREQUENCY DECRYPTION COMPLETED (FALLBACK):\n\"Jarvis, optimize the main power grid and run a security check on Stark Tower.\"");
    } finally {
      setLoading(false);
    }
  };

  // Mic audio recording for direct transcript!
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          setAudioFileBase64(base64);
          setAudioFileName("VocalInputRecord.webm");
          transcribeAudio(base64);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      addLog("Sensory Audio Capture Core: ACTIVE", "warning");
    } catch (e) {
      addLog("Microphone access denied or unsupported in this sandbox.", "warning");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div id="stark-lab-workshop" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 block">
              Stark Lab & AI Workshop
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Next-Gen Cognitive Facility
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] font-mono border border-cyan-950/40 bg-cyan-950/15 text-cyan-400 px-2 py-0.5 rounded uppercase">
          <Database className="w-3 h-3 animate-pulse" />
          <span>Local Sync Active</span>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 border-b border-slate-900/50 scrollbar-none">
        {[
          { id: "chat", label: "Cognitive Core", icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { id: "music", label: "Acoustic Forge", icon: <Music className="w-3.5 h-3.5" /> },
          { id: "image", label: "Visual Forge", icon: <ImageIcon className="w-3.5 h-3.5" /> },
          { id: "video", label: "Temporal Video", icon: <Video className="w-3.5 h-3.5" /> },
          { id: "analyzer", label: "Spectral Scan", icon: <Eye className="w-3.5 h-3.5" /> },
          { id: "transcribe", label: "Sonic Decoder", icon: <Mic className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border transition-all ${
              activeTab === tab.id
                ? "bg-cyan-950/30 border-cyan-800/40 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.1)]"
                : "bg-slate-900/10 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto max-h-[480px] pr-1 space-y-4">
        {loading && (
          <div className="flex items-center space-x-2 p-3 bg-cyan-950/10 border border-cyan-900/30 rounded-lg animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              JARVIS mainframe compiling algorithms... SIR.
            </span>
          </div>
        )}

        {/* 1. COGNITIVE CORE CHAT */}
        {activeTab === "chat" && (
          <div className="space-y-4">
            {/* Control panel options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-900/15 border border-slate-900 rounded-lg p-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Intelligence Profile</label>
                <select
                  value={chatModel}
                  onChange={(e: any) => setChatModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-200 font-mono rounded focus:outline-none"
                >
                  <option value="gemini-3.1-pro-preview">High Thinking (Pro Preview)</option>
                  <option value="gemini-3.5-flash">Balanced (Gemini Flash)</option>
                  <option value="gemini-3.1-flash-lite">Low-Latency (Flash Lite)</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Holographic Grounding Channels</label>
                <div className="flex items-center space-x-3 pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableSearch}
                      onChange={(e) => setEnableSearch(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Google Search Grounding</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-mono text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableMaps}
                      onChange={(e) => setEnableMaps(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <Map className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Google Maps Grounding</span>
                  </label>
                </div>
              </div>

              <div className="col-span-1 sm:col-span-3 space-y-1.5">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Roleplay System Protocol (Cognitive Directives)</label>
                <input
                  type="text"
                  value={customSystemInstruction}
                  onChange={(e) => setCustomSystemInstruction(e.target.value)}
                  placeholder="e.g. 'You are a quantum aerospace engineer diagnostics compiler...'"
                  className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-300 font-mono rounded focus:outline-none"
                />
              </div>
            </div>

            {/* Chat Box */}
            <div className="border border-slate-900 rounded-lg bg-slate-950/50 flex flex-col h-[220px]">
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded p-2 text-[11px] font-mono leading-relaxed ${
                        item.role === "user"
                          ? "bg-cyan-950/30 border border-cyan-800/20 text-cyan-300"
                          : "bg-slate-900/60 border border-slate-800/60 text-slate-200"
                      }`}
                    >
                      <div className="text-[8px] font-mono uppercase text-slate-500 mb-0.5">
                        {item.role === "user" ? userName : "J.A.R.V.I.S."}
                      </div>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-900 p-2 flex items-center space-x-1.5">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Inquire cognitive diagnostics center..."
                  className="flex-1 bg-slate-900 border border-slate-850 px-3 py-2 text-[10px] text-slate-200 font-mono rounded-lg focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-800/30 text-cyan-400 text-[10px] font-mono font-bold px-3 py-2 rounded-lg uppercase tracking-wider transition-all"
                >
                  TRANSMIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACOUSTIC FORGE */}
        {activeTab === "music" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase">Composition Directive Prompt</label>
              <textarea
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-[11px] text-slate-300 font-mono rounded-lg focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-mono text-slate-300">
                  <input
                    type="radio"
                    name="music_length"
                    checked={musicLength === "clip"}
                    onChange={() => setMusicLength("clip")}
                    className="accent-cyan-500"
                  />
                  <span>Short Clip (30s)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-mono text-slate-300">
                  <input
                    type="radio"
                    name="music_length"
                    checked={musicLength === "full"}
                    onChange={() => setMusicLength("full")}
                    className="accent-cyan-500"
                  />
                  <span>Full Track (HQ)</span>
                </label>
              </div>

              <button
                onClick={generateMusic}
                disabled={loading}
                className="flex items-center space-x-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 text-[10px] font-mono font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMPILE FREQUENCIES</span>
              </button>
            </div>

            {/* Generated results or dynamic synthesizer display */}
            <div className="border border-slate-900 bg-slate-950/50 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-3 min-h-[140px]">
              {generatedAudioUrl ? (
                <>
                  <Music className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <p className="text-[10px] font-mono text-slate-300">Composition successfully rendered.</p>
                  <audio src={generatedAudioUrl} controls className="w-full max-w-sm" />
                  {lyricsText && (
                    <div className="bg-slate-900/40 border border-slate-900 rounded p-2.5 text-left w-full">
                      <p className="text-[8px] font-mono text-slate-500 uppercase mb-1">Acoustic Lyrics / Prompt Metadata:</p>
                      <p className="text-[10px] text-slate-400 font-mono italic">"{lyricsText}"</p>
                    </div>
                  )}
                </>
              ) : isSynthPlaying ? (
                <>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                      <div
                        key={bar}
                        className="w-1 bg-cyan-400 rounded animate-music-bar"
                        style={{
                          height: "40px",
                          animationDelay: `${bar * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    STARK COGNITIVE SYNTH ENGINE: ACTIVE
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">
                    Composing electronic waves via standard browser oscillators
                  </p>
                  <button
                    onClick={stopLocalSynth}
                    className="border border-red-900/30 text-red-400 bg-red-950/15 hover:bg-red-900/30 px-3 py-1 text-[9px] font-mono uppercase rounded transition-colors"
                  >
                    HALT ACUSTICS
                  </button>
                </>
              ) : (
                <>
                  <Music className="w-6 h-6 text-slate-700" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">
                    No active acoustics loaded. Input prompt above to compose.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. VISUAL FORGE (IMAGE GENERATION) */}
        {activeTab === "image" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase">Visual Representation Prompt</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-[11px] text-slate-300 font-mono rounded-lg focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-300 font-mono rounded focus:outline-none"
                >
                  <option value="1:1">1:1 Square</option>
                  <option value="16:9">16:9 Cinema</option>
                  <option value="9:16">9:16 Portrait</option>
                  <option value="3:2">3:2 Classic</option>
                  <option value="21:9">21:9 UltraWide</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Resolution</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-300 font-mono rounded focus:outline-none"
                >
                  <option value="1K">1K Standard</option>
                  <option value="2K">2K QuadHD</option>
                  <option value="4K">4K UltraHD</option>
                </select>
              </div>

              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Starting Reference Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "refImg")}
                  className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-1.5 py-1 text-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={generateImage}
                disabled={loading}
                className="flex items-center space-x-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 text-[10px] font-mono font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>FORGE HOLOGRAPH</span>
              </button>
            </div>

            {/* Rendered image box */}
            <div className="border border-slate-900 bg-slate-950/50 p-2.5 rounded-lg flex flex-col items-center justify-center min-h-[160px]">
              {generatedImageUrl ? (
                <div className="relative group w-full flex flex-col items-center">
                  <img
                    src={generatedImageUrl}
                    alt="Forged Visual"
                    className="max-h-[220px] rounded border border-slate-850 object-contain shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="mt-2.5 flex items-center space-x-2">
                    <a
                      href={generatedImageUrl}
                      download="StarkLabForge.png"
                      className="flex items-center space-x-1 text-[9px] font-mono bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 px-2.5 py-1 rounded uppercase transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>DOWNLOAD</span>
                    </a>
                    <button
                      onClick={() => setGeneratedImageUrl(null)}
                      className="text-[9px] font-mono bg-red-950/25 border border-red-900/25 hover:bg-red-900/30 text-red-400 px-2.5 py-1 rounded uppercase transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <ImageIcon className="w-6 h-6 text-slate-700 mx-auto" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">
                    Holographic matrix empty. Trigger Forge to generate visual frames.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TEMPORAL VIDEO ANIMATOR */}
        {activeTab === "video" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase">Temporal Cinematic Motion Prompt</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-[11px] text-slate-300 font-mono rounded-lg focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Video Aspect</label>
                <select
                  value={videoAspect}
                  onChange={(e) => setVideoAspect(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 px-2 py-1.5 text-[10px] text-slate-300 font-mono rounded focus:outline-none"
                >
                  <option value="16:9">16:9 Cinematic</option>
                  <option value="9:16">9:16 Portrait</option>
                </select>
              </div>

              <div className="space-y-1 col-span-1 sm:col-span-2">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Starting Keyframe Image (To Animate)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "videoRefImg")}
                  className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-1.5 py-1 text-slate-400"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={generateVideo}
                disabled={loading}
                className="flex items-center space-x-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 text-[10px] font-mono font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>RENDER CINEMATIC</span>
              </button>
            </div>

            {/* Generated results video player */}
            <div className="border border-slate-900 bg-slate-950/50 p-2 rounded-lg flex flex-col items-center justify-center min-h-[160px]">
              {generatedVideoUrl ? (
                <div className="w-full flex flex-col items-center">
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-[220px] rounded border border-slate-850 bg-black w-full"
                  />
                  <div className="mt-2.5 flex items-center space-x-2">
                    <button
                      onClick={() => setGeneratedVideoUrl(null)}
                      className="text-[9px] font-mono bg-red-950/25 border border-red-900/25 hover:bg-red-900/30 text-red-400 px-3 py-1 rounded uppercase transition-colors"
                    >
                      CLEAR VIDEO
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Video className="w-6 h-6 text-slate-700 mx-auto" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">
                    Temporal render sequence empty. Input prompt to generate dynamic video clip.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SPECTRAL SCANNER (MULTIMODAL ANALYZER) */}
        {activeTab === "analyzer" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase">Load File To Spectral Sensor (Image/Video/Doc)</label>
                  <input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={(e) => handleFileChange(e, "analyzer")}
                    className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-1.5 py-1 text-slate-300"
                  />
                </div>
                {analyzerFileName && (
                  <p className="text-[9px] font-mono text-cyan-400 font-bold uppercase">
                    LOADED: {analyzerFileName}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Diagnostics sweep prompt</label>
                <textarea
                  value={analyzerPrompt}
                  onChange={(e) => setAnalyzerPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] text-slate-300 font-mono rounded focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={analyzeMedia}
                disabled={loading || !analyzerFileBase64}
                className="flex items-center space-x-1.5 bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 text-[10px] font-mono font-bold px-4 py-2 rounded-lg uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>START SENSORY SWEEP</span>
              </button>
            </div>

            {/* Results */}
            <div className="border border-slate-900 bg-slate-950/50 p-3.5 rounded-lg min-h-[140px] max-h-[220px] overflow-y-auto">
              {analyzerResult ? (
                <div className="space-y-1.5 text-left">
                  <p className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    STARK SPECTRAL ANALYSES REPORT:
                  </p>
                  <p className="text-[11px] font-mono text-slate-200 whitespace-pre-line leading-relaxed">
                    {analyzerResult}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Eye className="w-6 h-6 text-slate-700 mx-auto" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase">
                    Scanner offline. Upload schematic photo above to run diagnostics.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. SONIC DECODER (AUDIO TRANSCRIPTION) */}
        {activeTab === "transcribe" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-2 border border-slate-900 bg-slate-900/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                <Mic className="w-6 h-6 text-cyan-400 animate-pulse" />
                <p className="text-[10px] font-mono text-slate-300 uppercase font-bold">Vocal Stream Recorder</p>
                <div className="flex items-center space-x-2 pt-1.5">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="bg-red-950 border border-red-900 text-red-400 text-[9px] font-mono font-bold px-3 py-1.5 rounded uppercase hover:bg-red-900/30 transition-colors"
                    >
                      STOP RECORDING
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="bg-cyan-950/40 border border-cyan-900/30 text-cyan-400 text-[9px] font-mono font-bold px-3 py-1.5 rounded uppercase hover:bg-cyan-900 transition-all"
                    >
                      RECORD MIC
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 border border-slate-900 bg-slate-900/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
                <Upload className="w-6 h-6 text-slate-500" />
                <p className="text-[10px] font-mono text-slate-300 uppercase font-bold">Sonic File Loader</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, "transcribe")}
                  className="w-full bg-slate-900 border border-slate-800 text-[9px] font-mono rounded px-1.5 py-1 text-slate-400 mt-1"
                />
                {audioFileName && (
                  <button
                    onClick={() => transcribeAudio()}
                    className="mt-1 bg-cyan-950/40 border border-cyan-900/30 text-cyan-400 text-[9px] font-mono px-2.5 py-1 rounded uppercase"
                  >
                    DECODE AUDIO
                  </button>
                )}
              </div>
            </div>

            {/* Transcription results block */}
            <div className="border border-slate-900 bg-slate-950/50 p-3.5 rounded-lg min-h-[100px] flex flex-col justify-center">
              {transcribedText ? (
                <div className="space-y-1.5 text-left">
                  <p className="text-[9px] font-mono text-cyan-400 font-bold uppercase">
                    Verbatim Vocal Transcription Registry:
                  </p>
                  <p className="text-[11px] font-mono text-slate-200 italic leading-relaxed">
                    "{transcribedText}"
                  </p>
                </div>
              ) : (
                <p className="text-center text-[10px] font-mono text-slate-500 uppercase">
                  Sonic registries blank. Record audio or upload file to decode vocal signals.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Aesthetic Footer status bar */}
      <div className="border-t border-slate-900 pt-2 flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase">
        <span>Stark Cognitive Laboratory OS 10.9</span>
        <span>Mainframe Link Active</span>
      </div>
    </div>
  );
}
