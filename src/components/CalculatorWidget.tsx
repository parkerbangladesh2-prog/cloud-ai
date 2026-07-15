import React, { useState, useEffect } from "react";
import { Calculator, Delete, CornerDownLeft } from "lucide-react";

export default function CalculatorWidget() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  // Handle calculator button clicks
  const handleButtonClick = (value: string) => {
    if (isFinished) {
      if (["+", "-", "*", "/"].includes(value)) {
        setEquation(display + " " + value + " ");
        setDisplay("0");
      } else {
        setDisplay(value === "." ? "0." : value);
        setEquation("");
      }
      setIsFinished(false);
      return;
    }

    if (value === "C") {
      setDisplay("0");
      setEquation("");
    } else if (value === "backspace") {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay("0");
      }
    } else if (["+", "-", "*", "/"].includes(value)) {
      setEquation((prev) => prev + (display === "0" ? "" : display) + " " + value + " ");
      setDisplay("0");
    } else if (value === "=") {
      try {
        const fullEquation = equation + display;
        // Clean up equation for evaluation safely
        const sanitizedEquation = fullEquation.replace(/[^0-9.+\-*/\s]/g, "");
        // eslint-disable-next-line no-eval
        const result = eval(sanitizedEquation);
        
        setDisplay(Number(result).toString());
        setEquation(fullEquation + " =");
        setIsFinished(true);
      } catch (err) {
        setDisplay("Error");
        setIsFinished(true);
      }
    } else if (value === ".") {
      if (!display.includes(".")) {
        setDisplay((prev) => prev + ".");
      }
    } else {
      // Numbers
      if (display === "0") {
        setDisplay(value);
      } else {
        setDisplay((prev) => prev + value);
      }
    }
  };

  // Keyboard support for convenience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9]/.test(key)) {
        handleButtonClick(key);
      } else if (["+", "-", "*", "/"].includes(key)) {
        handleButtonClick(key);
      } else if (key === "." || key === ",") {
        handleButtonClick(".");
      } else if (key === "Enter" || key === "=") {
        handleButtonClick("=");
      } else if (key === "Backspace") {
        handleButtonClick("backspace");
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        handleButtonClick("C");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, equation, isFinished]);

  return (
    <div id="jarvis-calculator-panel" className="flex flex-col h-full bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md shadow-2xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-2">
        <Calculator className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
          Quantum Calculation Core
        </span>
      </div>

      {/* Screen Display */}
      <div className="bg-slate-900/90 border border-slate-850 p-3 rounded-lg text-right font-mono select-none">
        <div className="text-[10px] text-slate-500 h-4 truncate">
          {equation}
        </div>
        <div className="text-xl font-bold text-cyan-400 overflow-x-auto whitespace-nowrap mt-1 scrollbar-none">
          {display}
        </div>
      </div>

      {/* Keypad Layout */}
      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <button
          onClick={() => handleButtonClick("C")}
          className="col-span-2 py-2.5 rounded bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/30 active:scale-95 transition-all uppercase text-[10px] font-bold"
        >
          Clear
        </button>
        <button
          onClick={() => handleButtonClick("backspace")}
          className="py-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleButtonClick("/")}
          className="py-2.5 rounded bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 hover:bg-cyan-900/30 active:scale-95 transition-all font-bold"
        >
          /
        </button>

        {["7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handleButtonClick(num)}
            className="py-2.5 rounded bg-slate-900/60 border border-slate-850 text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleButtonClick("*")}
          className="py-2.5 rounded bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 hover:bg-cyan-900/30 active:scale-95 transition-all font-bold"
        >
          *
        </button>

        {["4", "5", "6"].map((num) => (
          <button
            key={num}
            onClick={() => handleButtonClick(num)}
            className="py-2.5 rounded bg-slate-900/60 border border-slate-850 text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleButtonClick("-")}
          className="py-2.5 rounded bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 hover:bg-cyan-900/30 active:scale-95 transition-all font-bold"
        >
          -
        </button>

        {["1", "2", "3"].map((num) => (
          <button
            key={num}
            onClick={() => handleButtonClick(num)}
            className="py-2.5 rounded bg-slate-900/60 border border-slate-850 text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleButtonClick("+")}
          className="py-2.5 rounded bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 hover:bg-cyan-900/30 active:scale-95 transition-all font-bold"
        >
          +
        </button>

        <button
          onClick={() => handleButtonClick("0")}
          className="col-span-2 py-2.5 rounded bg-slate-900/60 border border-slate-850 text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={() => handleButtonClick(".")}
          className="py-2.5 rounded bg-slate-900/60 border border-slate-850 text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
        >
          .
        </button>
        <button
          onClick={() => handleButtonClick("=")}
          className="py-2.5 rounded bg-cyan-600 text-white font-bold hover:bg-cyan-500 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
