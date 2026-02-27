"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Terminal } from "lucide-react";
import { useLayoutStore } from "@/stores/layout";
import { useViewStore } from "@/stores/view";

export function Header() {
  const [time, setTime] = useState<string>("");
  const [marketOpen, setMarketOpen] = useState(false);
  const resetLayouts = useLayoutStore((s) => s.resetLayouts);
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      // Check if US market is open (9:30 AM - 4:00 PM ET, Mon-Fri)
      const et = new Date(
        now.toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      const hours = et.getHours();
      const minutes = et.getMinutes();
      const day = et.getDay();
      const timeInMinutes = hours * 60 + minutes;
      setMarketOpen(
        day >= 1 && day <= 5 && timeInMinutes >= 570 && timeInMinutes < 960
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-terminal-border bg-terminal-panel">
      <div className="flex items-center gap-3">
        <Terminal className="w-5 h-5 text-terminal-accent" />
        <h1 className="text-sm font-bold tracking-wider text-terminal-accent">
          AI TERMINAL
        </h1>
        <div className="hidden md:flex items-center gap-1 ml-2">
          <button
            onClick={() => setMode("dashboard")}
            className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
              mode === "dashboard"
                ? "bg-terminal-accent text-terminal-bg"
                : "text-terminal-muted hover:bg-terminal-hover"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setMode("deep-dive")}
            className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
              mode === "deep-dive"
                ? "bg-terminal-accent text-terminal-bg"
                : "text-terminal-muted hover:bg-terminal-hover"
            }`}
          >
            Dive Deep
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              marketOpen ? "bg-terminal-up" : "bg-terminal-down"
            }`}
          />
          <span className="text-xs text-terminal-muted">
            {marketOpen ? "MARKET OPEN" : "MARKET CLOSED"}
          </span>
        </div>
        <span className="text-xs font-mono text-terminal-muted">{time}</span>
        <button
          onClick={resetLayouts}
          className="text-terminal-muted hover:text-terminal-text transition-colors"
          title="Reset layout"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
