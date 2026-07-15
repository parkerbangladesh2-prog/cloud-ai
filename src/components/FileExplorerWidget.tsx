import React, { useState } from "react";
import { Folder, FileCode, Shield, FileText, Info, ArrowLeft, Terminal } from "lucide-react";
import { Note } from "../types";

interface FileExplorerWidgetProps {
  notes: Note[];
}

export default function FileExplorerWidget({ notes }: FileExplorerWidgetProps) {
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  // Notes file raw string
  const getNotesFileContent = () => {
    if (notes.length === 0) {
      return "# JARVIS SECURE NOTES ARCHIVE\n# No saved entries found.";
    }
    return notes
      .map((note) => `[${note.timestamp}] ${note.title.toUpperCase()}\n${note.content}\n------------------------------`)
      .join("\n\n");
  };

  const files = [
    {
      name: "jarvis_notes.txt",
      icon: <FileText className="w-4 h-4 text-cyan-400" />,
      size: `${getNotesFileContent().length} bytes`,
      content: getNotesFileContent(),
    },
    {
      name: "stark_protocols.json",
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      size: "348 bytes",
      content: JSON.stringify(
        {
          security_status: "LEVEL_5_CLEARANCE",
          arc_reactor_integrity: "100%",
          house_party_protocol: "STANDBY",
          active_armor_suit: "Mark Lxxxv",
          voice_assistant: "J.A.R.V.I.S. (Active)",
          developer_clearance: "Tony Stark",
        },
        null,
        2
      ),
    },
    {
      name: "system_config.ini",
      icon: <FileCode className="w-4 h-4 text-amber-400" />,
      size: "185 bytes",
      content: `[Assistant]
name = Jarvis
voice_rate = 175
voice_index = 0
preferred_mode = voice

[User]
name = Sir
clearance = Founder
preferred_greeting = Good morning, Sir.`,
    },
  ];

  const activeFileObj = files.find((f) => f.name === currentFile);

  return (
    <div id="jarvis-explorer-panel" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Title Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <Folder className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Holographic File Systems
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-500">ROOT://SYS/LOCAL</div>
      </div>

      <div className="flex-1 flex flex-col min-h-[220px]">
        {currentFile && activeFileObj ? (
          /* File Preview Panel */
          <div className="flex-1 flex flex-col p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <button
                onClick={() => setCurrentFile(null)}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>BACK</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-500">{activeFileObj.size}</span>
                <span className="text-xs font-mono font-bold text-slate-300">{activeFileObj.name}</span>
              </div>
            </div>
            
            {/* Holographic terminal styled viewer */}
            <div className="flex-1 overflow-y-auto max-h-[140px] bg-black/75 border border-slate-900 p-3 rounded font-mono text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {activeFileObj.content}
            </div>
          </div>
        ) : (
          /* Directory List */
          <div className="p-3 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1">
              Active Directory Directory Contents
            </p>
            <div className="space-y-1.5 overflow-y-auto max-h-[175px]">
              {files.map((file) => (
                <div
                  key={file.name}
                  onClick={() => setCurrentFile(file.name)}
                  className="flex items-center justify-between p-2.5 rounded bg-slate-900/30 border border-slate-900 hover:border-cyan-800/40 hover:bg-slate-900/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1 rounded bg-slate-950 border border-slate-850 group-hover:border-cyan-800/40">
                      {file.icon}
                    </div>
                    <span className="text-xs font-mono text-slate-300 group-hover:text-cyan-400 transition-colors">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{file.size}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start space-x-2 bg-slate-900/20 border border-slate-900/60 p-2.5 rounded text-[10px] font-mono text-slate-400 mt-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                Notes are synced automatically into <code className="text-cyan-300">jarvis_notes.txt</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
