import React, { useState } from "react";
import { FileText, Plus, Trash2, Volume2, Search, Edit2, Save } from "lucide-react";
import { Note } from "../types";

interface NotepadWidgetProps {
  notes: Note[];
  onAddNote: (content: string, title?: string) => void;
  onDeleteNote: (id: string) => void;
  onSpeakText: (text: string) => void;
}

export default function NotepadWidget({ notes, onAddNote, onDeleteNote, onSpeakText }: NotepadWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    onAddNote(newNoteContent, newNoteTitle);
    setNewNoteTitle("");
    setNewNoteContent("");
    setIsAdding(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="jarvis-notepad-panel" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Secure Notepad Core
          </span>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setViewingNote(null);
          }}
          className="flex items-center space-x-1 text-[10px] font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/40 px-2 py-1 rounded transition-all"
        >
          <Plus className="w-3 h-3" />
          <span>NEW ENTRY</span>
        </button>
      </div>

      {/* Notepad body */}
      <div className="flex-1 flex flex-col min-h-[220px]">
        {isAdding ? (
          /* Create Note Form */
          <form onSubmit={handleAdd} className="flex-1 flex flex-col p-3 space-y-3">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Entry Subject (Optional)..."
              className="bg-slate-900 border border-slate-850 px-3 py-1.5 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Record your thoughts here..."
              required
              rows={5}
              className="flex-1 bg-slate-900 border border-slate-850 p-3 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
            />
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[10px] font-mono border border-slate-800 text-slate-400 px-3 py-1.5 rounded hover:bg-slate-900"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="text-[10px] font-mono bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>SAVE NOTE</span>
              </button>
            </div>
          </form>
        ) : viewingNote ? (
          /* View Note Details */
          <div className="flex-1 flex flex-col p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="text-sm font-semibold text-slate-200">{viewingNote.title}</h4>
              <span className="text-[10px] font-mono text-slate-500">{viewingNote.timestamp}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[140px] text-xs font-mono text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded border border-slate-900">
              {viewingNote.content}
            </div>
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => onSpeakText(`Reading note: ${viewingNote.title}. ${viewingNote.content}`)}
                className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300"
                title="Read aloud via voice synthesizer"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-[10px] font-mono font-semibold uppercase">Dictate Entry</span>
              </button>
              <button
                onClick={() => setViewingNote(null)}
                className="text-[10px] font-mono border border-slate-800 text-slate-400 px-3 py-1.5 rounded hover:bg-slate-900"
              >
                BACK TO LIST
              </button>
            </div>
          </div>
        ) : (
          /* Notes List */
          <div className="flex-1 flex flex-col">
            {/* Search notes */}
            <div className="p-2 border-b border-slate-900 bg-slate-900/10 flex items-center relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes archive..."
                className="w-full bg-slate-900/80 border border-slate-850 pl-9 pr-3 py-1 text-[11px] rounded text-slate-300 focus:outline-none focus:border-cyan-500/40 placeholder-slate-500"
              />
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto max-h-[180px] p-2 space-y-1">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-500 italic">No notepad archives found.</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/80 transition-all cursor-pointer group"
                    onClick={() => setViewingNote(note)}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h5 className="text-xs font-semibold text-slate-300 truncate">{note.title}</h5>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{note.content}</p>
                    </div>
                    <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpeakText(note.content);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400"
                        title="Read entry"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNote(note.id);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
