"use client";

import React, { useEffect } from "react";
import { useAuraStore } from "@/store/useAuraStore";
import TopNav from "@/components/TopNav";
import LiveCanvasChart from "@/components/LiveCanvasChart";
import TradeTicketPanel from "@/components/TradeTicketPanel";
import PortfolioPositions from "@/components/PortfolioPositions";
import CommandPaletteModal from "@/components/CommandPaletteModal";

export default function AuraPulseTerminalPage() {
  const { tickMarket } = useAuraStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickMarket();
    }, 1400);
    return () => clearInterval(interval);
  }, [tickMarket]);

  return (
    <div className="min-h-screen bg-carbon terminal-grid-bg flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <LiveCanvasChart />
          </div>
          <div className="lg:col-span-4">
            <TradeTicketPanel />
          </div>
        </div>

        <PortfolioPositions />
      </main>

      <CommandPaletteModal />
    </div>
  );
}