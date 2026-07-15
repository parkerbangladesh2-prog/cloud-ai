// Speech and Sound Synthesizer Utility for JARVIS

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Check for speech recognition browser support
const SpeechRecognitionAPI =
  typeof window !== "undefined" &&
  ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export const isSpeechRecognitionSupported = (): boolean => {
  return !!SpeechRecognitionAPI;
};

// Start custom voice capture
export class JarvisSpeechRecognizer {
  private recognition: any = null;
  private callbacks: SpeechRecognitionCallbacks;

  constructor(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
    if (isSpeechRecognitionSupported()) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        if (this.callbacks.onStart) this.callbacks.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.callbacks.onResult) {
          this.callbacks.onResult(
            finalTranscript || interimTranscript,
            !!finalTranscript
          );
        }
      };

      this.recognition.onerror = (event: any) => {
        if (this.callbacks.onError) this.callbacks.onError(event.error);
      };

      this.recognition.onend = () => {
        if (this.callbacks.onEnd) this.callbacks.onEnd();
      };
    }
  }

  start() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn("Recognition already active or failed to start", err);
      }
    }
  }

  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Failed to stop recognition", err);
      }
    }
  }
}

// Text to Speech
export const speakText = (
  text: string,
  config: {
    voiceName?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech Synthesis is not supported in this browser.");
    return;
  }

  // Cancel any currently speaking text
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = config.rate ?? 1.1;
  utterance.pitch = config.pitch ?? 1.0;
  utterance.volume = config.volume ?? 1.0;

  // Find voice
  const voices = window.speechSynthesis.getVoices();
  if (config.voiceName) {
    const selectedVoice = voices.find((v) => v.name === config.voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  } else {
    // Try to find a nice British voice as J.A.R.V.I.S default!
    const jarvisVoice =
      voices.find((v) => v.lang.includes("en-GB") && v.name.toLowerCase().includes("male")) ||
      voices.find((v) => v.lang.includes("en-GB")) ||
      voices.find((v) => v.lang.includes("en-US") && v.name.toLowerCase().includes("male")) ||
      voices[0];
    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }
  }

  if (config.onStart) utterance.onstart = config.onStart;
  if (config.onEnd) utterance.onend = config.onEnd;
  
  utterance.onerror = (event: any) => {
    // Filter out standard benign browser events like 'interrupted', 'canceled', and 'not-allowed'
    const errorType = event && event.error;
    if (errorType === "interrupted" || errorType === "canceled" || errorType === "not-allowed") {
      console.log(`Speech synthesis status update: ${errorType}`);
      if (config.onEnd) config.onEnd();
      return;
    }
    if (config.onError) {
      config.onError(event);
    }
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
};

// Synthesize futuristic Stark sound effects using Web Audio API
export class StarkSoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  // A sleek startup sweep tone
  playStartup() {
    this.initCtx();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Play double futuristic chime
    this.playTone(880, "sine", now, 0.1, 0.15);
    this.playTone(1320, "triangle", now + 0.12, 0.08, 0.25);
    this.playTone(1760, "sine", now + 0.22, 0.05, 0.4);
  }

  // Listening chime (alerting user Jarvis is now listening)
  playListening() {
    this.initCtx();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Smooth rising sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.18);
    
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Stopped listening beep
  playStopListening() {
    this.initCtx();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Short high-tech dual click-chime
    this.playTone(1040, "sine", now, 0.05, 0.08);
    this.playTone(780, "sine", now + 0.06, 0.03, 0.1);
  }

  // Notification sound for saving / commands
  playActionSuccess() {
    this.initCtx();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    this.playTone(1200, "triangle", now, 0.08, 0.15);
    this.playTone(1600, "sine", now + 0.08, 0.06, 0.25);
  }

  // Error buzz
  playError() {
    this.initCtx();
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.3);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playTone(freq: number, type: OscillatorType, startTime: number, volume: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0.0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}
