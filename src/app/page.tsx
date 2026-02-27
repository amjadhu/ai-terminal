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
  const selectedTickerSelectionSeq = useSettingsStore(
    (s) => s.selectedTickerSelectionSeq
  );
  const prevSelectionSeq = useRef<number>(selectedTickerSelectionSeq);

  useEffect(() => {
    if (mode !== "dashboard") return;
    if (selectedTickerSelectionSeq <= prevSelectionSeq.current) {
      prevSelectionSeq.current = selectedTickerSelectionSeq;
      return;
    }
    prevSelectionSeq.current = selectedTickerSelectionSeq;
    const target = document.getElementById("symbol-workbench");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedTickerSelectionSeq, mode]);

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
