export type SenderType = "user" | "jarvis" | "system";

export interface Message {
  id: string;
  text: string;
  sender: SenderType;
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export type WidgetType = 
  | "notepad" 
  | "calculator" 
  | "terminal" 
  | "file-explorer" 
  | "websites" 
  | "weather-news" 
  | "system-control" 
  | "reminders" 
  | "music-player" 
  | "clipboard-mgr"
  | "stark-lab"
  | "command-help";

export interface WidgetState {
  id: WidgetType;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TerminalLog {
  id: string;
  text: string;
  type: "info" | "warning" | "success" | "command";
  timestamp: string;
}

export interface JarvisConfig {
  userName: string;
  useVoice: boolean;
  voiceRate: number;
  voicePitch: number;
  selectedVoiceName: string;
  isSystemOnline: boolean;
}
