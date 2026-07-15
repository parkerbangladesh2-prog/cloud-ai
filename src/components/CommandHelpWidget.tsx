import React, { useState } from "react";
import { HelpCircle, Search, Terminal, Navigation, Briefcase, MessageSquare, Play, X } from "lucide-react";

interface CommandHelpWidgetProps {
  onExecuteCommand?: (cmd: string) => void;
  onClose?: () => void;
}

interface CommandInfo {
  trigger: string;
  example: string;
  description: string;
}

interface CategorizedCommands {
  [category: string]: {
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    items: CommandInfo[];
  };
}

export default function CommandHelpWidget({ onExecuteCommand, onClose }: CommandHelpWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const categories: CategorizedCommands = {
    "System Control": {
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      color: "text-emerald-400",
      bg: "bg-emerald-950/20",
      border: "border-emerald-900/30",
      items: [
        { trigger: "open system / open control", example: "open control panel", description: "Launches the diagnostic control panel with system stats." },
        { trigger: "lock system / trigger lock", example: "lock system", description: "Activates cybersecurity lockout and locks down all widgets." },
        { trigger: "restart system", example: "restart system", description: "Performs soft reboot of local mainframe modules." },
        { trigger: "volume up / volume down", example: "volume up", description: "Adjusts speech synthesizer volume incrementally." },
        { trigger: "mute / unmute voice", example: "mute voice", description: "Mutes or unmutes the vocal synthesis output." },
        { trigger: "screenshot", example: "capture screenshot", description: "Takes a high-res capture of the entire active workspace." },
        { trigger: "battery", example: "check battery", description: "Retrieves active power cell levels and charging states." }
      ]
    },
    "Navigation": {
      icon: <Navigation className="w-4 h-4 text-cyan-400" />,
      color: "text-cyan-400",
      bg: "bg-cyan-950/20",
      border: "border-cyan-900/30",
      items: [
        { trigger: "open terminal", example: "open terminal console", description: "Brings the terminal logs and telemetry to foreground." },
        { trigger: "open notepad", example: "open notepad", description: "Launches the secure local database notepad core." },
        { trigger: "open calculator", example: "open calculator", description: "Launches the holographic quantum calculator." },
        { trigger: "open file explorer / open file", example: "open file explorer", description: "Opens file system registry to view saved items." },
        { trigger: "open websites / open launcher", example: "open websites", description: "Opens the web navigator launcher utility." },
        { trigger: "open weather / open news", example: "open weather", description: "Launches weather telemetry and global headline feed." },
        { trigger: "open reminders", example: "open reminders", description: "Brings up active scheduled triggers and alarms." },
        { trigger: "open music / open player", example: "open music player", description: "Launches acoustics playback systems." },
        { trigger: "open clipboard / open buffer", example: "open clipboard", description: "Launches clipboard tracking buffer registry." },
        { trigger: "open [website]", example: "open github", description: "Quick opens specific websites (e.g. GitHub, Google, YouTube)." }
      ]
    },
    "Productivity": {
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
      color: "text-amber-400",
      bg: "bg-amber-950/20",
      border: "border-amber-900/30",
      items: [
        { trigger: "take note / make note [content]", example: "take note buy vibranium", description: "Saves a new note directly to local storage." },
        { trigger: "read notes / read my notes", example: "read my notes", description: "Vocally reads back all saved note entries." },
        { trigger: "search for [term] on google", example: "search for cold fusion", description: "Launches a secure web search in a new browser tab." },
        { trigger: "set reminder for [time] minutes", example: "set reminder for 10 minutes", description: "Schedules a voice alarm in specified duration." },
        { trigger: "clear notepad", example: "clear notepad", description: "Wipes all current items in notepad registry." },
        { trigger: "calculator [expression]", example: "calculator 52 * 41", description: "Performs mathematical operations verbally." }
      ]
    },
    "Communication": {
      icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
      color: "text-purple-400",
      bg: "bg-purple-950/20",
      border: "border-purple-900/30",
      items: [
        { trigger: "chat / talk / ask jarvis", example: "ask jarvis what is iron man's suit made of", description: "Initiates multi-turn cognitive conversation with Gemini." },
        { trigger: "generate music", example: "generate cinematic orchestral music", description: "Triggers Lyria Music Forge to generate and play audio." },
        { trigger: "create image [prompt]", example: "create image of stark tower at sunset", description: "Triggers Gemini Image Forge with resolution and size options." },
        { trigger: "analyze image", example: "analyze uploaded image", description: "Triggers multimodal cognitive scanning of media." },
        { trigger: "voice conversation", example: "start voice conversation", description: "Initiates real-time Live API audio connection." }
      ]
    }
  };

  // Filter commands based on search query
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    const filtered: CategorizedCommands = {};

    Object.entries(categories).forEach(([catName, catData]) => {
      const matchedItems = catData.items.filter(
        (item) =>
          item.trigger.toLowerCase().includes(query) ||
          item.example.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );

      if (matchedItems.length > 0) {
        filtered[catName] = {
          ...catData,
          items: matchedItems
        };
      }
    });

    return filtered;
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div id="jarvis-command-help" className="flex flex-col h-full bg-slate-950/85 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 block">
              Command Registry Database
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Vocal Interface Directive Map
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-900/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter voice commands (e.g., 'note', 'music', 'lock')..."
          className="w-full bg-slate-900 border border-slate-800/80 pl-10 pr-4 py-2 text-xs rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono transition-colors"
        />
      </div>

      {/* Categories Map */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[450px] scrollbar-thin scrollbar-thumb-slate-850">
        {Object.entries(filteredCategories).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Terminal className="w-8 h-8 text-slate-700 animate-pulse mb-2" />
            <p className="text-xs font-mono text-slate-400">No matching voice directives found.</p>
            <p className="text-[10px] font-mono text-slate-500 mt-1">Try querying general terms like "open" or "note".</p>
          </div>
        ) : (
          Object.entries(filteredCategories).map(([catName, catData]) => (
            <div key={catName} className={`border border-slate-900 bg-slate-950/40 rounded-lg p-3 space-y-2.5`}>
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                <div className="flex items-center space-x-2">
                  {catData.icon}
                  <h4 className={`text-[11px] font-mono font-bold uppercase tracking-wider ${catData.color}`}>
                    {catName}
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase">
                  {catData.items.length} Directives
                </span>
              </div>

              <div className="space-y-1.5">
                {catData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded bg-slate-900/30 hover:bg-slate-900/70 border border-slate-900/40 transition-colors group"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          {item.trigger}
                        </span>
                        <span className="text-[9px] font-mono bg-slate-900 text-cyan-400/80 border border-cyan-950 px-1.5 py-0.2 rounded">
                          "{item.example}"
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.description}
                      </p>
                    </div>

                    {onExecuteCommand && (
                      <button
                        onClick={() => onExecuteCommand(item.example)}
                        className="mt-2 sm:mt-0 self-end sm:self-center flex items-center space-x-1 text-[9px] font-mono bg-cyan-950/40 hover:bg-cyan-900 border border-cyan-900/30 text-cyan-400 px-2 py-1 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Simulate speaking this command"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>TEST</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Guide Note Footer */}
      <div className="border-t border-slate-900 pt-2 text-[9px] font-mono text-slate-500 text-center uppercase">
        Use spacebar, tap the neural orb, or speak your wake-word to initiate.
      </div>
    </div>
  );
}
