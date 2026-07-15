import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  FileText, 
  Calculator as CalcIcon, 
  Folder, 
  Globe, 
  Settings, 
  Volume2, 
  User, 
  Power, 
  Mic, 
  Keyboard, 
  RotateCcw,
  Sparkles,
  RefreshCw,
  CloudSun,
  Laptop,
  Bell,
  Music,
  Clipboard,
  Shield,
  Eye,
  Lock as LockIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Message, Note, WidgetType, WidgetState, TerminalLog, JarvisConfig } from "./types";
import { 
  speakText, 
  stopSpeaking, 
  isSpeechRecognitionSupported, 
  JarvisSpeechRecognizer, 
  getAvailableVoices, 
  StarkSoundEffects 
} from "./utils/speech";

import ArcReactor from "./components/ArcReactor";
import TerminalWidget from "./components/TerminalWidget";
import NotepadWidget from "./components/NotepadWidget";
import CalculatorWidget from "./components/CalculatorWidget";
import FileExplorerWidget from "./components/FileExplorerWidget";
import WebSitesWidget from "./components/WebSitesWidget";
import WeatherNewsWidget from "./components/WeatherNewsWidget";
import SystemControlWidget from "./components/SystemControlWidget";
import RemindersWidget, { Reminder } from "./components/RemindersWidget";
import MusicPlayerWidget from "./components/MusicPlayerWidget";
import ClipboardWidget from "./components/ClipboardWidget";
import StarkLabWidget from "./components/StarkLabWidget";
import CommandHelpWidget from "./components/CommandHelpWidget";
import { getLocalJarvisResponse } from "./utils/localBrain";
import html2canvas from "html2canvas";
import Draggable from "react-draggable";

// Websites configuration from Python script
const WEBSITES: Record<string, string> = {
  youtube: "https://youtube.com",
  google: "https://google.com",
  gmail: "https://mail.google.com",
  github: "https://github.com",
  facebook: "https://facebook.com",
  chatgpt: "https://chat.openai.com",
  claude: "https://claude.ai",
  stackoverflow: "https://stackoverflow.com",
};

// Default setup
const INITIAL_WIDGETS: WidgetState[] = [
  { id: "terminal", title: "Terminal Console", isOpen: true, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "notepad", title: "Secure Notepad", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "calculator", title: "Quantum Calculator", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "file-explorer", title: "File Systems", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "websites", title: "Web Navigation", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "weather-news", title: "Weather & News Scan", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "system-control", title: "System Control Panel", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "reminders", title: "Reminders & Timers", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "music-player", title: "Audio & Acoustics", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "clipboard-mgr", title: "Clipboard & Buffers", isOpen: false, isMinimized: false, x: 0, y: 0, width: 400, height: 350 },
  { id: "stark-lab", title: "Stark Lab & AI Workshop", isOpen: true, isMinimized: false, x: 0, y: 0, width: 550, height: 480 },
  { id: "command-help", title: "Vocal Commands Database", isOpen: false, isMinimized: false, x: 0, y: 0, width: 450, height: 400 },
];

const DraggableComponent = Draggable as any;

export default function App() {
  // Config state
  const [config, setConfig] = useState<JarvisConfig>(() => {
    const saved = localStorage.getItem("jarvis_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, isSystemOnline: true }; // Start online
      } catch (e) {
        // Fallback
      }
    }
    return {
      userName: "Sir",
      useVoice: true,
      voiceRate: 1.15,
      voicePitch: 1.0,
      selectedVoiceName: "",
      isSystemOnline: true,
    };
  });

  // Database states
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("jarvis_notes");
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; text: string }>>([]);
  const [widgets, setWidgets] = useState<WidgetState[]>(INITIAL_WIDGETS);
  const [assistantStatus, setAssistantStatus] = useState<"online" | "listening" | "speaking" | "thinking" | "sleeping">("online");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [isMicAllowed, setIsMicAllowed] = useState(true);

  // New J.A.R.V.I.S. v2 advanced states
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem("jarvis_reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [systemVolume, setSystemVolume] = useState<number>(() => {
    const saved = localStorage.getItem("jarvis_volume");
    return saved ? parseFloat(saved) : 0.6;
  });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [wakeWordMode, setWakeWordMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("jarvis_wakeword");
    return saved ? saved === "true" : false;
  });

  // Sound effects reference
  const soundsRef = useRef<StarkSoundEffects | null>(null);
  const recognizerRef = useRef<JarvisSpeechRecognizer | null>(null);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem("jarvis_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("jarvis_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("jarvis_reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("jarvis_wakeword", String(wakeWordMode));
  }, [wakeWordMode]);

  // Initial startup
  useEffect(() => {
    // Sound engine
    soundsRef.current = new StarkSoundEffects();
    
    // Load voices
    const loadVoices = () => {
      const voices = getAvailableVoices();
      setAvailableVoices(voices);
      
      // Auto-set standard British voice if not set
      if (voices.length > 0 && !config.selectedVoiceName) {
        const gbVoice = voices.find(v => v.lang.includes("en-GB") && v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.lang.includes("en-GB")) ||
                        voices.find(v => v.lang.includes("en-US") && v.name.toLowerCase().includes("male")) ||
                        voices[0];
        if (gbVoice) {
          setConfig(prev => ({ ...prev, selectedVoiceName: gbVoice.name }));
        }
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Print welcome logs
    addLog("Initializing J.A.R.V.I.S. Core Systems...", "info");
    addLog("Voice Synthesis Engine: ONLINE", "info");
    
    if (isSpeechRecognitionSupported()) {
      addLog("Speech Recognition Engine: ONLINE", "info");
    } else {
      addLog("Speech Recognition unsupported in this browser. Please use Chrome/Edge.", "warning");
      setIsMicAllowed(false);
    }

    // Play startup chime
    setTimeout(() => {
      soundsRef.current?.playStartup();
      wishUser();
    }, 1200);

    return () => {
      stopSpeaking();
    };
  }, []);

  // Spacebar hotkey to summon JARVIS
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        toggleVoiceCapture();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [assistantStatus, config]);

  // Log logger
  const addLog = (text: string, type: TerminalLog["type"] = "info") => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newLog: TerminalLog = {
      id: Math.random().toString(),
      text,
      type,
      timestamp,
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Speak aloud helper
  const jarvisSpeak = (text: string, onEndCallback?: () => void) => {
    addLog(`Jarvis: ${text}`, "success");
    setAssistantStatus("speaking");
    
    speakText(text, {
      voiceName: config.selectedVoiceName,
      rate: config.voiceRate,
      pitch: config.voicePitch,
      volume: systemVolume,
      onStart: () => {
        setAssistantStatus("speaking");
      },
      onEnd: () => {
        setAssistantStatus("online");
        if (onEndCallback) onEndCallback();
      },
      onError: (err) => {
        console.warn("Speech Synthesis Notice:", err);
        setAssistantStatus("online");
      }
    });
  };

  // Time based greeting
  const wishUser = () => {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 17) {
      greeting = "Good afternoon";
    }

    const text = `${greeting}, ${config.userName}. J.A.R.V.I.S. is online and ready to assist you.`;
    jarvisSpeak(text);
  };

  // Open / Close widgets safely
  const toggleWidget = (id: WidgetType, state?: boolean) => {
    setWidgets(prev =>
      prev.map(w => {
        if (w.id === id) {
          const isOpen = state !== undefined ? state : !w.isOpen;
          if (isOpen) {
            addLog(`Holographic Panel [${w.title}] opened.`, "info");
          }
          return { ...w, isOpen, isMinimized: false };
        }
        return w;
      })
    );
  };

  // Voice capture trigger
  const toggleVoiceCapture = () => {
    if (assistantStatus === "sleeping") {
      setAssistantStatus("online");
      soundsRef.current?.playStartup();
      jarvisSpeak("Systems fully online, Sir. How may I help you?");
      return;
    }

    if (assistantStatus === "listening") {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!isSpeechRecognitionSupported()) {
      jarvisSpeak("I'm sorry, Sir. Speech recognition is not supported in this browser. Please use typed commands.");
      return;
    }

    stopSpeaking();
    soundsRef.current?.playListening();
    setTranscriptText("");

    const recognizer = new JarvisSpeechRecognizer({
      onStart: () => {
        setAssistantStatus("listening");
        addLog(wakeWordMode ? "Continuous Wake-Word monitoring online..." : "Listening to microphone...", "info");
      },
      onResult: (text, isFinal) => {
        setTranscriptText(text);
        if (isFinal) {
          const lowerText = text.toLowerCase();
          addLog(`You said: "${text}"`, "command");
          
          if (wakeWordMode) {
            if (lowerText.includes("hey jarvis") || lowerText.includes("jarvis")) {
              // Extract command after wake word
              const cleanCmd = lowerText
                .replace("hey jarvis", "")
                .replace("jarvis", "")
                .trim();
              
              if (cleanCmd) {
                processCommand(cleanCmd);
              } else {
                jarvisSpeak("Yes, Sir? Standing by for instructions.");
              }
            } else {
              addLog(`Buffer skipped. (Awaiting wake word prefix)`, "info");
            }
          } else {
            processCommand(text);
          }
        }
      },
      onError: (error) => {
        console.error("Speech Recognition Error:", error);
        if (error !== "no-speech") {
          addLog(`Microphone alert: ${error}`, "warning");
          soundsRef.current?.playError();
        }
        setAssistantStatus("online");
      },
      onEnd: () => {
        if (wakeWordMode && assistantStatus !== "sleeping") {
          // Restart microphone immediately for continuous listening
          setTimeout(() => {
            if (recognizerRef.current) {
              try {
                recognizerRef.current.start();
              } catch(e) {}
            }
          }, 300);
        } else {
          setAssistantStatus("online");
        }
      }
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      soundsRef.current?.playStopListening();
    }
    setAssistantStatus("online");
  };

  // Greet/Speak user custom notes
  const readAllNotes = () => {
    if (notes.length === 0) {
      jarvisSpeak("You have no saved notes in your archive, Sir.");
      return;
    }

    const notesSummary = notes.map((n, idx) => `Note number ${idx + 1}: ${n.title}. Content: ${n.content}`).join(". ");
    jarvisSpeak(`Reading your archives, Sir. ${notesSummary}`);
  };

  // Add notes database helper
  const addNote = (content: string, title?: string) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedTitle = title?.trim() || `Log entry ${notes.length + 1}`;
    
    const newNote: Note = {
      id: Math.random().toString(),
      title: formattedTitle,
      content: content.trim(),
      timestamp,
    };

    setNotes(prev => [newNote, ...prev]);
    soundsRef.current?.playActionSuccess();
    addLog(`Saved note archive: [${formattedTitle}]`, "success");
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    addLog("Note archive deleted.", "warning");
  };

  // Reboot simulator procedure
  const restartSystemProcedure = () => {
    addLog("Initiating system reboot...", "warning");
    jarvisSpeak("Rebooting all mainframe subsystems, Sir. Standing by.", () => {
      setAssistantStatus("sleeping");
      setTimeout(() => {
        soundsRef.current?.playStartup();
        setAssistantStatus("online");
        addLog("Mainframe reboot complete. Stark firewall level 5 fully active.", "success");
        jarvisSpeak("All systems rebooted and running at optimum capacity, Sir.");
      }, 3000);
    });
  };

    // Main Command Routing Engine
    const processCommand = async (query: string) => {
      const cmd = query.trim().toLowerCase();
      if (!cmd) return;
  
      // Help Directive Trigger
      if (cmd.includes("help") || cmd.includes("commands") || cmd.includes("capabilities") || cmd.includes("vocal database")) {
        toggleWidget("command-help", true);
        jarvisSpeak("Accessing vocal directive mapping database. Standard operational map brought to screen, Sir.");
        return;
      }
  
      // Stark Lab / AI Forge Trigger
      if (cmd.includes("stark lab") || cmd.includes("ai workshop") || cmd.includes("open lab") || cmd.includes("ai forge")) {
        toggleWidget("stark-lab", true);
        jarvisSpeak("Recharging visual matrix arrays. Opening Stark AI laboratory workshop, Sir.");
        return;
      }
  
      // 1. Time Command
    if (cmd.includes("time")) {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
      jarvisSpeak(`The current time is ${now}, Sir.`);
      return;
    }

    // 2. Date Command
    if (cmd.includes("date") || cmd.includes("day is it")) {
      const today = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      jarvisSpeak(`Today is ${today}, Sir.`);
      return;
    }

    // 3. Self-introduction
    if (cmd.includes("who are you") || cmd.includes("your name")) {
      jarvisSpeak("I am J.A.R.V.I.S., your personal holographic assistant, built to assist you with everyday operations, Sir.");
      return;
    }

    // 4. Tell Joke
    if (cmd.includes("joke")) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "I would tell you a UDP joke, but you might not get it.",
        "There are 10 types of people. Those who understand binary, and those who don't.",
        "Why did the database administrator leave the restaurant? Because there were no join conditions.",
        "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?"
      ];
      const selected = jokes[Math.floor(Math.random() * jokes.length)];
      jarvisSpeak(selected);
      return;
    }

    // 5. Take Note
    if (cmd.includes("take a note") || cmd.includes("make a note") || cmd.includes("write a note") || cmd.includes("take note")) {
      toggleWidget("notepad", true);
      // Strip command keywords to get note text if present
      const noteContent = cmd
        .replace("take a note", "")
        .replace("make a note", "")
        .replace("write a note", "")
        .replace("take note", "")
        .trim();

      if (noteContent) {
        addNote(noteContent);
        jarvisSpeak(`Got it. I have saved that note for you, Sir.`);
      } else {
        jarvisSpeak("Opening notepad, Sir. What should I write down?", () => {
          // Auto trigger voice recognition after 1s for note content if user was on voice
          if (config.useVoice) {
            setTimeout(() => {
              startListening();
            }, 500);
          }
        });
      }
      return;
    }

    // 6. Read Notes
    if (cmd.includes("read my notes") || cmd.includes("show my notes") || cmd.includes("read notes")) {
      toggleWidget("notepad", true);
      readAllNotes();
      return;
    }

    // 7. Open Widgets
    if (cmd.includes("open notepad")) {
      toggleWidget("notepad", true);
      jarvisSpeak("Opening Secure Notepad console, Sir.");
      return;
    }
    if (cmd.includes("open calculator")) {
      toggleWidget("calculator", true);
      jarvisSpeak("Opening holographic calculator, Sir.");
      return;
    }
    if (cmd.includes("open terminal")) {
      toggleWidget("terminal", true);
      jarvisSpeak("Bringing terminal telemetry logs to the foreground, Sir.");
      return;
    }
    if (cmd.includes("open explorer") || cmd.includes("open file explorer") || cmd.includes("open file")) {
      toggleWidget("file-explorer", true);
      jarvisSpeak("Opening local storage file systems, Sir.");
      return;
    }
    if (cmd.includes("open websites") || cmd.includes("open web") || cmd.includes("open launcher")) {
      toggleWidget("websites", true);
      jarvisSpeak("Opening Stark web navigator console, Sir.");
      return;
    }
    if (cmd.includes("open weather") || cmd.includes("open news")) {
      toggleWidget("weather-news", true);
      jarvisSpeak("Opening weather and headline intelligence feed, Sir.");
      return;
    }
    if (cmd.includes("open system") || cmd.includes("open control")) {
      toggleWidget("system-control", true);
      jarvisSpeak("Opening system diagnostics control panel, Sir.");
      return;
    }
    if (cmd.includes("open reminders") || cmd.includes("open timers")) {
      toggleWidget("reminders", true);
      jarvisSpeak("Bringing reminders and scheduling database online, Sir.");
      return;
    }
    if (cmd.includes("open music") || cmd.includes("open player")) {
      toggleWidget("music-player", true);
      jarvisSpeak("Opening acoustics player core, Sir.");
      return;
    }
    if (cmd.includes("open clipboard") || cmd.includes("open buffer")) {
      toggleWidget("clipboard-mgr", true);
      jarvisSpeak("Opening clipboard buffers, Sir.");
      return;
    }

    // 8. Open Specific Website
    for (const site of Object.keys(WEBSITES)) {
      if (cmd.includes(`open ${site}`)) {
        jarvisSpeak(`Opening ${site}, Sir.`);
        window.open(WEBSITES[site], "_blank");
        toggleWidget("websites", true);
        return;
      }
    }

    // 9. Search Google
    if (cmd.includes("search for") || cmd.includes("google")) {
      const term = cmd
        .replace("search for", "")
        .replace("on google", "")
        .replace("google", "")
        .trim();
      if (term) {
        jarvisSpeak(`Searching Google for ${term}, Sir.`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, "_blank");
        return;
      }
    }

    // 10. Weather Command
    if (cmd.includes("weather")) {
      const match = cmd.match(/weather (?:in|for|at) ([a-zA-Z\s]+)/);
      const targetCity = match ? match[1].trim() : "";
      toggleWidget("weather-news", true);
      jarvisSpeak(`Querying climate telemetry for ${targetCity || "your current coordinates"}, Sir...`);
      try {
        const response = await fetch(`/api/jarvis/weather?city=${encodeURIComponent(targetCity)}`);
        const data = await response.json();
        if (data.weather) {
          jarvisSpeak(data.weather);
        } else {
          jarvisSpeak(`I could not retrieve weather telemetry for ${targetCity || "your location"}, Sir.`);
        }
      } catch (err) {
        jarvisSpeak("System transmission error while retrieving weather parameters, Sir.");
      }
      return;
    }

    // 11. News Headlines Command
    if (cmd.includes("news")) {
      let category = "general";
      if (cmd.includes("tech") || cmd.includes("technology")) category = "tech";
      else if (cmd.includes("business")) category = "business";
      else if (cmd.includes("sports")) category = "sports";

      toggleWidget("weather-news", true);
      jarvisSpeak(`Decrypting news feeds for ${category} headlines, Sir...`);
      try {
        const response = await fetch(`/api/jarvis/news?category=${category}`);
        const data = await response.json();
        if (data.news && data.news.length > 0) {
          const topHeadlines = data.news.slice(0, 3).map((item: any, idx: number) => `Headline ${idx + 1}: ${item.title}`).join(". ");
          jarvisSpeak(`Here are the top headlines on this channel, Sir: ${topHeadlines}`);
        } else {
          jarvisSpeak("No news transmissions found on this category, Sir.");
        }
      } catch (err) {
        jarvisSpeak("Experienced an interrupt while scanning news feeds, Sir.");
      }
      return;
    }

    // 12. Safe Calculator Command
    const hasMathWords = ["plus", "minus", "times", "divided", "multiplied"].some(op => cmd.includes(op));
    if (cmd.includes("calculate") || hasMathWords) {
      toggleWidget("calculator", true);
      let expr = cmd.replace("calculate", "").replace("what is", "").trim();
      expr = expr.replace(/plus/g, "+")
                 .replace(/minus/g, "-")
                 .replace(/times/g, "*")
                 .replace(/multiplied by/g, "*")
                 .replace(/divided by/g, "/")
                 .replace(/x/g, "*");
      try {
        if (/^[0-9.+\-*/()\s]+$/.test(expr)) {
          const result = new Function(`return ${expr}`)();
          jarvisSpeak(`The calculation is complete, Sir. The result is ${result}.`);
        } else {
          jarvisSpeak("Arithmetic formula contains unsupported characters, Sir.");
        }
      } catch (e) {
        jarvisSpeak("I couldn't process that math expression, Sir.");
      }
      return;
    }

    // 13. Timer / Reminder Setup Command
    const reminderMatch = cmd.match(/remind me to (.+) in (\d+) minutes?/);
    if (reminderMatch) {
      const message = reminderMatch[1];
      const minutes = parseFloat(reminderMatch[2]);
      toggleWidget("reminders", true);

      const newReminder: Reminder = {
        id: Math.random().toString(36).substr(2, 9),
        message: message.trim(),
        fireTime: Date.now() + minutes * 60 * 1000,
        isFired: false,
        minutes: minutes,
      };

      setReminders(prev => [newReminder, ...prev]);
      jarvisSpeak(`Reminder queued successfully, Sir. I will notify you to ${message} in ${minutes} minutes.`);
      return;
    }

    // 14. Music Acoustic Controls
    if (cmd.includes("play music") || cmd.includes("play song") || cmd.startsWith("play ")) {
      toggleWidget("music-player", true);
      jarvisSpeak("Initializing acoustical synthesizer. Adjusting frequencies, Sir.");
      return;
    }

    // 15. Power Cells Battery Level
    if (cmd.includes("battery")) {
      toggleWidget("system-control", true);
      if (typeof navigator !== "undefined" && (navigator as any).getBattery) {
        try {
          const batt = await (navigator as any).getBattery();
          const pct = Math.round(batt.level * 100);
          const charging = batt.charging ? "currently charging" : "running on backup battery cells";
          jarvisSpeak(`Mainframe power level is at ${pct} percent, and ${charging}, Sir.`);
        } catch (e) {
          jarvisSpeak("Unable to reach battery sensors. Operating on standard backup cells, Sir.");
        }
      } else {
        jarvisSpeak("Power reserves are operating at eighty seven percent capacity, Sir.");
      }
      return;
    }

    // 16. Local Screen capture screenshot
    if (cmd.includes("screenshot")) {
      toggleWidget("system-control", true);
      jarvisSpeak("Capturing holographic screenshot of current UI workspace layout, Sir. Standby.");
      setTimeout(async () => {
        try {
          const targetElement = document.getElementById("root");
          if (targetElement) {
            const canvas = await html2canvas(targetElement, {
              backgroundColor: "#070b13",
              scale: 1,
              logging: false,
            });
            const imgData = canvas.toDataURL("image/png");
            setScreenshots((prev) => [imgData, ...prev.slice(0, 3)]);
            
            // Auto download
            const link = document.createElement("a");
            link.download = `jarvis_screenshot_${Date.now()}.png`;
            link.href = imgData;
            link.click();
            addLog("Mainframe screenshot captured and exported.", "success");
          }
        } catch (e) {
          addLog("Screenshot capture failed. Check browser graphics context.", "warning");
        }
      }, 1500);
      return;
    }

    // 17. Security lockdown
    if (cmd.includes("lock screen") || cmd.includes("lock the computer") || cmd.trim() === "lock") {
      jarvisSpeak("Initiating security lockdown protocol, Sir.", () => {
        setIsLocked(true);
      });
      return;
    }

    // 18. Reboot PC / System restart
    if (cmd.includes("reboot") || cmd.includes("restart the computer")) {
      restartSystemProcedure();
      return;
    }

    // 19. Public IP address registry lookup
    if (cmd.includes("ip address")) {
      toggleWidget("system-control", true);
      jarvisSpeak("Scanning public networking gateways for your IP address, Sir...");
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        jarvisSpeak(`Your live public IP registry is ${data.ip || "127.0.0.1"}, Sir.`);
      } catch (e) {
        jarvisSpeak("External network lookup timed out. Mainframe is local, Sir.");
      }
      return;
    }

    // 20. System Performance and statistics
    if (cmd.includes("system stats") || cmd.includes("cpu usage") || cmd.includes("memory usage") || cmd.includes("stats")) {
      toggleWidget("system-control", true);
      const perf = (performance as any).memory;
      const statsText = perf 
        ? `Mainframe processing is operating in nominal ranges, Sir. Memory allocation is occupying ${Math.round(perf.usedJSHeapSize / 1048576)} megabytes of ${Math.round(perf.jsHeapSizeLimit / 1048576)} limit.`
        : "Mainframe is operating at optimum capacity. Diagnostic levels are fully nominal, Sir.";
      jarvisSpeak(statsText);
      return;
    }

    // 21. Best effort Speech/Audio Volume modifiers
    if (cmd.includes("volume up")) {
      const newVol = Math.min(1, systemVolume + 0.2);
      setSystemVolume(newVol);
      localStorage.setItem("jarvis_volume", newVol.toString());
      jarvisSpeak("Acoustical delivery rate increased by twenty percent, Sir.");
      return;
    }
    if (cmd.includes("volume down")) {
      const newVol = Math.max(0, systemVolume - 0.2);
      setSystemVolume(newVol);
      localStorage.setItem("jarvis_volume", newVol.toString());
      jarvisSpeak("Acoustical delivery rate decreased by twenty percent, Sir.");
      return;
    }
    if (cmd.includes("mute")) {
      setSystemVolume(0);
      localStorage.setItem("jarvis_volume", "0");
      jarvisSpeak("Acoustical system output is now fully muted, Sir.");
      return;
    }

    // 22. Copy/Clipboard text buffers sync
    if (cmd.startsWith("copy ")) {
      toggleWidget("clipboard-mgr", true);
      const textToCopy = cmd.replace("copy ", "").trim();
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          jarvisSpeak(`Saved that string to your system clipboard buffer, Sir.`);
        } catch (e) {
          jarvisSpeak("Access to write clipboard is temporarily restricted in this frame, Sir.");
        }
      } else {
        jarvisSpeak("Your current browser does not support standard Clipboard write APIs, Sir.");
      }
      return;
    }
    if (cmd.includes("read clipboard") || cmd.includes("clipboard")) {
      toggleWidget("clipboard-mgr", true);
      jarvisSpeak(`Reading active clipboard buffers, Sir...`);
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const txt = await navigator.clipboard.readText();
          jarvisSpeak(`Your clipboard currently contains: ${txt || "empty space"}, Sir.`);
        } catch (e) {
          jarvisSpeak("Clipboard read permission was rejected by client security rules, Sir.");
        }
      } else {
        jarvisSpeak("Direct clipboard reading is restricted in this window mode, Sir.");
      }
      return;
    }

    // 23. System info
    if (cmd.includes("system info") || cmd.includes("about your system")) {
      const platformStr = (navigator as any).userAgentData?.platform || navigator.platform || "Unknown OS";
      const browserInfo = navigator.userAgent.split(" ").slice(-2).join(" ");
      jarvisSpeak(`Your terminal is running on ${platformStr} via ${browserInfo}, Sir.`);
      return;
    }

    // 24. Standby / Sleep
    if (cmd.includes("exit") || cmd.includes("quit") || cmd.includes("stop") || cmd.includes("goodbye") || cmd.includes("shut down") || cmd.includes("sleep")) {
      jarvisSpeak("Going to standby sleep mode, Sir. Speak to the Core to wake me back up.");
      setAssistantStatus("sleeping");
      return;
    }

    // 25. Wikipedia search using Gemini API
    if (cmd.includes("wikipedia") || cmd.startsWith("who is") || cmd.startsWith("what is")) {
      const topic = cmd
        .replace("wikipedia", "")
        .replace("search for", "")
        .replace("who is", "")
        .replace("what is", "")
        .trim();
      
      if (topic) {
        jarvisSpeak(`Searching records for ${topic}, Sir...`);
        queryGemini(`Explain what or who ${topic} is in exactly two concise sentences.`);
        return;
      }
    }

    // 26. Fallback to Gemini AI Server side route
    queryGemini(query);
  };

  // Gemini AI assistant query proxy
  const queryGemini = async (promptText: string) => {
    setAssistantStatus("thinking");
    addLog("Consulting core mainframe intelligence...", "info");

    try {
      // Assemble history format for multi-turn conversations
      const updatedHistory = [...chatHistory, { role: "user", text: promptText }];
      
      const response = await fetch("/api/jarvis/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          userName: config.userName,
          chatHistory: chatHistory.slice(-6), // Keep last 3 turns
        }),
      });

      const data = await response.json();
      
      if (data.reply) {
        setChatHistory(prev => [
          ...prev, 
          { role: "user", text: promptText },
          { role: "model", text: data.reply }
        ]);
        jarvisSpeak(data.reply);
      } else {
        throw new Error("Invalid reply format");
      }
    } catch (err) {
      console.warn("Mainframe connection offline. Activating local conversational buffers...");
      const reply = getLocalJarvisResponse(promptText, config.userName);
      setChatHistory(prev => [
        ...prev, 
        { role: "user", text: promptText },
        { role: "model", text: reply }
      ]);
      jarvisSpeak(reply);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#070b13] to-[#04060b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Status Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)] animate-pulse" />
            {assistantStatus === "listening" && (
              <div className="absolute -inset-0.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest font-mono text-slate-100 uppercase">
              J.A.R.V.I.S. INTERACTIVE
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">STARK INDUSTRIES MAINFRAME MODULE</p>
          </div>
        </div>

        {/* Quick Config Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1 border border-slate-800 bg-slate-900/30 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">USER:</span>
            <span className="font-semibold text-cyan-400">{config.userName.toUpperCase()}</span>
          </div>

          <button
            onClick={() => {
              if (assistantStatus === "sleeping") {
                setAssistantStatus("online");
                soundsRef.current?.playStartup();
                jarvisSpeak("Systems woke up. Welcome back, Sir.");
              } else {
                setAssistantStatus("sleeping");
                soundsRef.current?.playStopListening();
                jarvisSpeak("Entering standby protocol.");
              }
            }}
            title={assistantStatus === "sleeping" ? "Boot System" : "Shutdown"}
            className={`p-2 rounded-lg border transition-colors ${
              assistantStatus === "sleeping"
                ? "bg-red-950/20 border-red-900/30 text-red-400 hover:bg-red-900/30"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30"
            }`}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-colors ${
              showSettings 
                ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-400" 
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Settings Overlay Block */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="col-span-12 bg-slate-950/90 border border-slate-800 rounded-lg p-5 backdrop-blur-lg shadow-2xl space-y-4 mb-2"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Diagnostic settings panel</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">User Name Designation</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={config.userName}
                      onChange={(e) => setConfig(prev => ({ ...prev, userName: e.target.value }))}
                      placeholder="Sir..."
                      className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs rounded text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono"
                    />
                  </div>
                </div>

                {/* Speech Synthesis Voice Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Acoustic Vocal Driver</label>
                  <select
                    value={config.selectedVoiceName}
                    onChange={(e) => setConfig(prev => ({ ...prev, selectedVoiceName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono"
                  >
                    {availableVoices.length === 0 ? (
                      <option>Loading vocal engines...</option>
                    ) : (
                      availableVoices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Speech Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Vocal Delivery Rate</label>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{config.voiceRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={config.voiceRate}
                    onChange={(e) => setConfig(prev => ({ ...prev, voiceRate: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Speech Pitch */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Acoustic Pitch</label>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{config.voicePitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={config.voicePitch}
                    onChange={(e) => setConfig(prev => ({ ...prev, voicePitch: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-900">
                <button
                  onClick={() => {
                    localStorage.removeItem("jarvis_notes");
                    localStorage.removeItem("jarvis_config");
                    setNotes([]);
                    addLog("Mainframe logs and configs cleared.", "warning");
                    soundsRef.current?.playError();
                  }}
                  className="text-[10px] font-mono text-red-400 hover:bg-red-950/20 border border-red-900/20 px-3 py-1.5 rounded transition-all"
                >
                  RESET DATABASES
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-[10px] font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/40 px-3 py-1.5 rounded transition-all"
                >
                  CLOSE SETTINGS
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT COLUMN: Central Orb Controller and Widget Launcher */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* Glowing Central Core Panel */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-6 backdrop-blur-md shadow-xl flex flex-col items-center">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest text-center border-b border-slate-900 pb-2 w-full mb-4">
              Neural Processing Core
            </h2>
            
            {/* Holographic Orb reactor */}
            <ArcReactor status={assistantStatus} onClick={toggleVoiceCapture} />

            {/* Transcript Area */}
            {assistantStatus === "listening" && transcriptText && (
              <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg w-full">
                <p className="text-[10px] font-mono text-emerald-500 font-bold uppercase mb-1">Live Audio Stream:</p>
                <p className="text-xs text-slate-300 italic font-mono">"{transcriptText}"</p>
              </div>
            )}
            
            {/* Quick action control panel */}
            <div className="mt-6 flex justify-center space-x-2 w-full border-t border-slate-900 pt-4">
              <button
                onClick={toggleVoiceCapture}
                className={`flex-1 text-xs font-mono py-2 rounded-lg border flex items-center justify-center space-x-2 transition-all ${
                  assistantStatus === "listening"
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{assistantStatus === "listening" ? "STOP MIC" : "WAKE MIC"}</span>
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  setAssistantStatus("online");
                }}
                disabled={assistantStatus !== "speaking"}
                className="px-3 py-2 rounded-lg border bg-slate-900/60 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Silence Voice Output"
              >
                Mute
              </button>
            </div>
          </div>

          {/* Holographic Launcher / Command Center */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 backdrop-blur-md shadow-xl">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
              Telemetry Widget Desk
            </h2>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {[
                { id: "stark-lab", title: "Stark Lab & AI Forge", icon: <Sparkles className="w-4 h-4" /> },
                { id: "command-help", title: "Vocal Commands DB", icon: <Keyboard className="w-4 h-4" /> },
                { id: "terminal", title: "Terminal Console", icon: <Terminal className="w-4 h-4" /> },
                { id: "notepad", title: "Secure Notepad Core", icon: <FileText className="w-4 h-4" /> },
                { id: "calculator", title: "Quantum Calculator", icon: <CalcIcon className="w-4 h-4" /> },
                { id: "file-explorer", title: "Holographic File Systems", icon: <Folder className="w-4 h-4" /> },
                { id: "websites", title: "Web Navigation", icon: <Globe className="w-4 h-4" /> },
                { id: "weather-news", title: "Weather & News Scan", icon: <CloudSun className="w-4 h-4" /> },
                { id: "system-control", title: "System Control Panel", icon: <Settings className="w-4 h-4" /> },
                { id: "reminders", title: "Reminders & Timers", icon: <Bell className="w-4 h-4" /> },
                { id: "music-player", title: "Audio & Acoustics", icon: <Music className="w-4 h-4" /> },
                { id: "clipboard-mgr", title: "Clipboard & Buffers", icon: <Clipboard className="w-4 h-4" /> },
              ].map((item) => {
                const widgetObj = widgets.find(w => w.id === item.id);
                const isOpen = widgetObj?.isOpen;

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleWidget(item.id as WidgetType)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all text-left ${
                      isOpen
                        ? "bg-cyan-950/20 border-cyan-800/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                        : "bg-slate-900/30 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-semibold uppercase">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold">
                      {isOpen ? "ENABLED" : "STANDBY"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Responsive workspace area of enabled panels */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {widgets
              .filter(w => w.isOpen)
              .map((w) => {
                return (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`col-span-1 md:col-span-2 ${
                      w.id === "terminal" || w.id === "stark-lab" ? "md:col-span-2" : ""
                    }`}
                  >
                    <DraggableComponent handle=".widget-drag-handle">
                      <div className="relative group border border-slate-850 bg-slate-950/40 rounded-lg overflow-hidden shadow-xl transition-all">
                        {/* Drag Handle Header bar */}
                        <div className="widget-drag-handle flex items-center justify-between bg-slate-950/80 border-b border-slate-900 px-4 py-2 cursor-grab active:cursor-grabbing hover:bg-slate-900/20 select-none">
                          <div className="flex items-center space-x-2">
                            <div className="grid grid-cols-2 gap-0.5 opacity-60">
                              <span className="block w-0.5 h-0.5 bg-cyan-400 rounded-full" />
                              <span className="block w-0.5 h-0.5 bg-cyan-400 rounded-full" />
                              <span className="block w-0.5 h-0.5 bg-cyan-400 rounded-full" />
                              <span className="block w-0.5 h-0.5 bg-cyan-400 rounded-full" />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                              {w.title}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-[8px] font-mono text-cyan-500/70 uppercase">
                              HOLOGRAPHIC MODULAR HUD
                            </span>
                            <button
                              onClick={() => toggleWidget(w.id, false)}
                              className="text-[9px] font-mono text-slate-500 hover:text-red-400 px-1.5 py-0.5 hover:bg-red-950/20 rounded transition-all"
                            >
                              CLOSE
                            </button>
                          </div>
                        </div>

                        {/* Render Specific Custom Widget */}
                        <div className="p-1">
                          {w.id === "terminal" && (
                            <TerminalWidget
                              logs={logs}
                              onSendCommand={processCommand}
                              onClearLogs={() => setLogs([])}
                            />
                          )}
                          {w.id === "notepad" && (
                            <NotepadWidget
                              notes={notes}
                              onAddNote={addNote}
                              onDeleteNote={deleteNote}
                              onSpeakText={(txt) => jarvisSpeak(txt)}
                            />
                          )}
                          {w.id === "calculator" && <CalculatorWidget />}
                          {w.id === "file-explorer" && <FileExplorerWidget notes={notes} />}
                          {w.id === "websites" && (
                            <WebSitesWidget
                              websites={WEBSITES}
                              onLaunchSite={(site, url) => {
                                jarvisSpeak(`Launching ${site}, Sir.`);
                                window.open(url, "_blank");
                              }}
                            />
                          )}
                          {w.id === "weather-news" && <WeatherNewsWidget />}
                          {w.id === "system-control" && (
                            <SystemControlWidget
                              onTriggerLock={() => setIsLocked(true)}
                              onRestartSystem={restartSystemProcedure}
                              systemVolume={systemVolume}
                              onVolumeChange={setSystemVolume}
                              addLog={addLog}
                            />
                          )}
                          {w.id === "reminders" && (
                            <RemindersWidget
                              onAddReminder={(rem) => setReminders(prev => [rem, ...prev])}
                              reminders={reminders}
                              onDeleteReminder={(id) => setReminders(prev => prev.filter(r => r.id !== id))}
                              speakText={jarvisSpeak}
                            />
                          )}
                          {w.id === "music-player" && <MusicPlayerWidget />}
                          {w.id === "clipboard-mgr" && <ClipboardWidget />}
                          {w.id === "stark-lab" && (
                            <StarkLabWidget
                              userName={config.userName}
                              addLog={addLog}
                              speakText={jarvisSpeak}
                            />
                          )}
                          {w.id === "command-help" && (
                            <CommandHelpWidget
                              onExecuteCommand={processCommand}
                              onClose={() => toggleWidget("command-help", false)}
                            />
                          )}
                        </div>
                      </div>
                    </DraggableComponent>
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* Placeholder if all widgets are closed */}
          {widgets.filter(w => w.isOpen).length === 0 && (
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-850 rounded-xl bg-slate-950/20 backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-cyan-500/50 animate-pulse mb-3" />
              <p className="text-xs font-mono text-slate-400">All telemetry widgets minimized.</p>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Toggle panels on the sidebar launcher or double-click to restore layout.
              </p>
              <button
                onClick={() => setWidgets(INITIAL_WIDGETS)}
                className="mt-4 flex items-center space-x-1.5 text-[10px] font-mono bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 px-3 py-1.5 rounded-lg transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESTORE FACTORY SETTINGS</span>
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Footer System Version */}
      <footer className="border-t border-slate-950 bg-slate-950/40 py-4 px-6 text-center text-[10px] font-mono text-slate-600 mt-auto">
        <span>STARK LABS OS v10.8.5 // DESIGNED EXCLUSIVELY FOR COGNITIVE UTILITIES</span>
        <span className="mx-2">|</span>
        <span className="text-slate-500 hover:text-cyan-500 transition-colors cursor-pointer" onClick={() => jarvisSpeak("I am operating with optimal efficiency, Sir.")}>
          SYSTEM CHECK: NOMINAL
        </span>
      </footer>
    </div>
  );
}
