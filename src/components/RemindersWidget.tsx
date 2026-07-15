import React, { useState, useEffect } from "react";
import { Bell, Play, Trash2, Clock, CheckCircle } from "lucide-react";

export interface Reminder {
  id: string;
  message: string;
  fireTime: number; // unix timestamp
  isFired: boolean;
  minutes: number;
}

interface RemindersWidgetProps {
  onAddReminder: (reminder: Reminder) => void;
  reminders: Reminder[];
  onDeleteReminder: (id: string) => void;
  speakText: (text: string) => void;
}

export default function RemindersWidget({
  onAddReminder,
  reminders,
  onDeleteReminder,
  speakText
}: RemindersWidgetProps) {
  const [msg, setMsg] = useState("");
  const [mins, setMins] = useState<number>(5);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  // Trigger active check loop for counting down and alert triggers
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const newRemaining: Record<string, string> = {};

      reminders.forEach((r) => {
        if (!r.isFired) {
          const diff = r.fireTime - now;
          if (diff <= 0) {
            // Trigger reminder
            r.isFired = true;
            speakText(`Attention, Sir. This is your scheduled reminder: ${r.message}`);
          } else {
            const minLeft = Math.floor(diff / 60000);
            const secLeft = Math.floor((diff % 60000) / 1000);
            newRemaining[r.id] = `${minLeft}m ${secLeft}s`;
          }
        }
      });

      setTimeRemaining(newRemaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [reminders, speakText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || mins <= 0) return;

    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      message: msg.trim(),
      fireTime: Date.now() + mins * 60 * 1000,
      isFired: false,
      minutes: mins,
    };

    onAddReminder(newReminder);
    speakText(`Got it, Sir. I will remind you to ${newReminder.message} in ${mins} minutes.`);
    setMsg("");
  };

  return (
    <div id="jarvis-reminders" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
        <Bell className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          Reminders & Scheduling Protocols
        </span>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="space-y-2 bg-slate-900/15 border border-slate-900 p-3 rounded-lg">
        <div className="flex flex-col space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400">REMINDER PROTOCOL MESSAGE</label>
          <input
            type="text"
            required
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="e.g., Deploy current Stark mainframe build"
            className="bg-slate-950 border border-slate-850 p-2 text-xs rounded text-slate-300 font-mono focus:outline-none focus:border-cyan-500/40"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-1 flex flex-col space-y-1">
            <label className="text-[10px] font-mono text-slate-400">DELAY (MINUTES)</label>
            <input
              type="number"
              min="0.1"
              step="any"
              required
              value={mins || ""}
              onChange={(e) => setMins(parseFloat(e.target.value) || 0)}
              className="bg-slate-950 border border-slate-850 p-2 text-xs rounded text-slate-300 font-mono focus:outline-none focus:border-cyan-500/40"
            />
          </div>

          <button
            type="submit"
            className="h-9 self-end px-4 text-xs font-mono bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800/40 rounded transition-all flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>QUEUE</span>
          </button>
        </div>
      </form>

      {/* Active and Fired Reminders list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px]">
        {reminders.length === 0 ? (
          <p className="text-center text-[10px] font-mono text-slate-500 italic py-6">
            No queued reminders active.
          </p>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between p-2.5 rounded border transition-all ${
                r.isFired
                  ? "bg-emerald-950/10 border-emerald-950/60 text-slate-500"
                  : "bg-slate-900/40 border-slate-850 text-slate-300"
              }`}
            >
              <div className="flex items-start space-x-2 truncate">
                {r.isFired ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                )}
                <div className="truncate">
                  <p className="text-xs font-semibold truncate leading-tight">{r.message}</p>
                  <p className="text-[9px] font-mono text-slate-500">
                    {r.isFired ? "Fired & logged" : `Duration: ${r.minutes}m`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {!r.isFired && (
                  <span className="text-[10px] font-mono bg-cyan-950/40 border border-cyan-900/30 text-cyan-400 px-2 py-0.5 rounded">
                    {timeRemaining[r.id] || "pending"}
                  </span>
                )}
                <button
                  onClick={() => onDeleteReminder(r.id)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800/30 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
