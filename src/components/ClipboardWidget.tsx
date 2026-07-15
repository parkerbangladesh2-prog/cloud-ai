import React, { useState } from "react";
import { Clipboard, Copy, Check, FileText, Plus } from "lucide-react";

export default function ClipboardWidget() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [clipboardContent, setClipboardContent] = useState<string>("");
  const [customSnippet, setCustomSnippet] = useState("");
  const [history, setHistory] = useState<string[]>([
    "git commit -m \"Jarvis v2 integration completed successfully\"",
    "curl -s https://wttr.in/StarkTower",
    "ANTHROPIC_API_KEY=sk-ant-stark-core-0092738739182379",
    "ssh stark-mainframe@core.local"
  ]);

  // Read actual clipboard from user device
  const readClientClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setClipboardContent(text || "Clipboard text read buffer is empty, Sir.");
      } else {
        setClipboardContent("Clipboard read permission is blocked or unavailable in this sandbox environment.");
      }
    } catch (e) {
      setClipboardContent("Clipboard read blocked. Please click manually or type below.");
    }
  };

  // Copy specific text to system clipboard
  const copyToClipboard = async (text: string, index: number) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (err) {
      console.error("Clipboard copy failure:", err);
    }
  };

  // Add custom history clip
  const addSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSnippet.trim()) return;
    setHistory((prev) => [customSnippet.trim(), ...prev]);
    setCustomSnippet("");
  };

  return (
    <div id="jarvis-clipboard" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <div className="flex items-center space-x-2">
          <Clipboard className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Clipboard & Buffers Registry
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Read Buffer Section */}
        <div className="space-y-3 bg-slate-900/20 border border-slate-900/60 p-3 rounded-lg flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
              LIVE SYSTEM CLIPBOARD READ
            </h4>
            <div className="bg-black/40 border border-slate-950 p-3 rounded text-[11px] font-mono text-cyan-400/90 min-h-[70px] whitespace-pre-wrap break-all leading-normal">
              {clipboardContent || "Click standard READ to sync from active device buffer."}
            </div>
          </div>

          <button
            onClick={readClientClipboard}
            className="w-full mt-2 py-1.5 text-xs font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/40 rounded transition-all active:scale-95"
          >
            READ LIVE CLIPBOARD
          </button>
        </div>

        {/* History / Write Buffers list */}
        <div className="space-y-3 bg-slate-900/20 border border-slate-900/60 p-3 rounded-lg flex flex-col">
          <h4 className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            <FileText className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
            REGISTERED SNIPPETS STORAGE
          </h4>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[110px] pr-1">
            {history.map((snippet, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between bg-black/20 border border-slate-900 hover:border-slate-800 p-2 rounded text-[10px] font-mono text-slate-300 transition-all"
              >
                <span className="truncate mr-3">{snippet}</span>
                <button
                  onClick={() => copyToClipboard(snippet, idx)}
                  className="shrink-0 p-1 bg-slate-900/60 hover:bg-slate-800 rounded border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-all"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Quick write input form */}
          <form onSubmit={addSnippet} className="relative flex items-center mt-1">
            <input
              type="text"
              value={customSnippet}
              onChange={(e) => setCustomSnippet(e.target.value)}
              placeholder="Add custom clipboard slot..."
              className="w-full bg-slate-950 border border-slate-850 pl-3 pr-10 py-1.5 text-[10px] rounded text-slate-300 focus:outline-none focus:border-cyan-500/40 placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="absolute right-1 text-slate-400 hover:text-cyan-400 p-1 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
