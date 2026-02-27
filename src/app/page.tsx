"use client";

import { Header } from "@/components/layout/Header";
import { CommandBar } from "@/components/layout/CommandBar";
import { TerminalGrid } from "@/components/layout/TerminalGrid";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <CommandBar />
      <main className="flex-1 overflow-auto">
        <TerminalGrid />
      </main>
    </div>
  );
}
