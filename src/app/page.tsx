"use client";

import { useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { CommandBar } from "@/components/layout/CommandBar";
import { TerminalGrid } from "@/components/layout/TerminalGrid";
import { DeepDiveView } from "@/components/deep-dive/DeepDiveView";
import { useViewStore } from "@/stores/view";
import { useSettingsStore } from "@/stores/settings";

export default function Home() {
  const mode = useViewStore((s) => s.mode);
  const selectedTicker = useSettingsStore((s) => s.selectedTicker);
  const prevTicker = useRef<string | null>(null);

  useEffect(() => {
    if (mode !== "dashboard") return;
    if (!prevTicker.current) {
      prevTicker.current = selectedTicker;
      return;
    }
    if (prevTicker.current === selectedTicker) return;
    prevTicker.current = selectedTicker;
    const target = document.getElementById("symbol-workbench");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedTicker, mode]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      {mode === "dashboard" ? <CommandBar /> : null}
      <main className="flex-1 overflow-auto">
        {mode === "dashboard" ? <TerminalGrid /> : <DeepDiveView />}
      </main>
    </div>
  );
}
