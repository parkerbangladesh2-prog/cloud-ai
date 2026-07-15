import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Trash2, HelpCircle } from "lucide-react";
import { TerminalLog } from "../types";

interface TerminalWidgetProps {
  logs: TerminalLog[];
  onSendCommand: (command: string) => void;
  onClearLogs: () => void;
}

export default function TerminalWidget({ logs, onSendCommand, onClearLogs }: TerminalWidgetProps) {
  const [inputValue, setInputValue] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendCommand(inputValue);
    setInputValue("");
  };

  const getLogColorClass = (type: TerminalLog["type"]) => {
    switch (type) {
      case "command":
        return "text-emerald-400";
      case "warning":
        return "text-amber-400";
      case "success":
        return "text-cyan-400 font-semibold";
      case "info":
      default:
        return "text-slate-300";
    }
  };

  return (
    <div id="jarvis-terminal-panel" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Jarvis Command Terminal
          </span>
        </div>
        <button
          onClick={onClearLogs}
          title="Clear terminal history"
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal logs content */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 h-[220px]">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic text-center py-4">No active connection logs.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-relaxed">
              <span className="text-slate-500 mr-2 select-none">[{log.timestamp}]</span>
              <span className={getLogColorClass(log.type)}>
                {log.type === "command" ? "> " : ""}
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Suggested commands quick-pills */}
      <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5">
        <span className="text-[10px] text-slate-500 font-mono flex items-center mr-1">
          <HelpCircle className="w-3 h-3 mr-0.5 text-cyan-500" /> SUGGESTED:
        </span>
        {[
          "what time is it",
          "what is the date",
          "who are you",
          "tell me a joke",
          "open calculator",
          "take a note",
          "read my notes",
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => onSendCommand(cmd)}
            className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 px-2 py-0.5 rounded transition-all whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input Field Form */}
      <form onSubmit={handleSubmit} className="flex border-t border-slate-800 bg-slate-900/30">
        <span className="flex items-center pl-4 pr-1 text-slate-500 font-mono text-xs select-none">
          $
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type command or ask JARVIS a question..."
          className="flex-1 bg-transparent border-0 px-2 py-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="px-4 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors flex items-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
