"use client";

import { Header } from "@/components/layout/Header";
import { CommandBar } from "@/components/layout/CommandBar";
import { TerminalGrid } from "@/components/layout/TerminalGrid";
import { DeepDiveView } from "@/components/deep-dive/DeepDiveView";
import { useViewStore } from "@/stores/view";

export default function Home() {
  const mode = useViewStore((s) => s.mode);

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
