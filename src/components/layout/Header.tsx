"use client";

import { useEffect, useState } from "react";
import { Moon, RotateCcw, Sun, Terminal } from "lucide-react";
import { useLayoutStore } from "@/stores/layout";
import { useViewStore } from "@/stores/view";
import { RollingTicker } from "@/components/layout/RollingTicker";
import { useSettingsStore } from "@/stores/settings";

export function Header() {
  const [time, setTime] = useState<string>("");
  const [marketOpen, setMarketOpen] = useState(false);
  const resetLayouts = useLayoutStore((s) => s.resetLayouts);
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const dashboardMode = useSettingsStore((s) => s.dashboardMode);
  const setDashboardMode = useSettingsStore((s) => s.setDashboardMode);

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

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b border-terminal-border bg-terminal-panel">
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

      <RollingTicker />

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
        <div className="hidden md:flex items-center gap-1 border border-terminal-border rounded p-0.5">
          <button
            onClick={() => setDashboardMode("full")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              dashboardMode === "full"
                ? "bg-terminal-accent text-terminal-bg"
                : "text-terminal-muted hover:bg-terminal-hover"
            }`}
            title="Show all widgets"
          >
            FULL
          </button>
          <button
            onClick={() => setDashboardMode("pro")}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              dashboardMode === "pro"
                ? "bg-terminal-accent text-terminal-bg"
                : "text-terminal-muted hover:bg-terminal-hover"
            }`}
            title="Trim to high-signal daily workflow"
          >
            PRO
          </button>
        </div>
        <button
          onClick={toggleTheme}
          className="text-terminal-muted hover:text-terminal-text transition-colors"
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
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
