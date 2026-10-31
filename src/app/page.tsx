"use client";

import React, { useEffect, useState } from "react";
import { useAuraStore } from "../store/useAuraStore";
import TopNav from "../components/TopNav";
import LiveCanvasChart from "../components/LiveCanvasChart";
import OrderBookPanel from "../components/OrderBookPanel";
import TradeTicketPanel from "../components/TradeTicketPanel";
import PortfolioPositions from "../components/PortfolioPositions";
import CommandPaletteModal from "../components/CommandPaletteModal";

type MobileTab = "ALL" | "CHART" | "BOOK" | "TRADE";

export default function AuraPulseTerminalPage() {
  const { tickMarket, lang } = useAuraStore();
  const [mobileTab, setMobileTab] = useState<MobileTab>("ALL");

  useEffect(() => {
    const interval = setInterval(() => {
      tickMarket();
    }, 1400);
    return () => clearInterval(interval);
  }, [tickMarket]);

  return (
    <div className="min-h-screen bg-[#030509] terminal-grid-bg flex flex-col">
      <TopNav />

      {/* سوییچر سریع مخصوص موبایل اندروید */}
      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="lg:hidden max-w-[1680px] w-full mx-auto px-3 pt-3"
      >
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#050811] border border-white/15 font-mono text-xs">
          {[
            { id: "ALL", label: lang === "fa" ? "نمای کل" : "All View" },
            { id: "CHART", label: lang === "fa" ? "نمودار" : "Chart" },
            { id: "TRADE", label: lang === "fa" ? "معامله" : "Trade" },
            { id: "BOOK", label: lang === "fa" ? "سفارشات" : "Book" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMobileTab(t.id as MobileTab)}
              className={`py-2 rounded-lg font-bold transition-all ${
                mobileTab === t.id
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-[1680px] w-full mx-auto px-3 lg:px-8 py-4 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div
            className={`lg:col-span-6 ${
              mobileTab === "ALL" || mobileTab === "CHART" ? "block" : "hidden lg:block"
            }`}
          >
            <LiveCanvasChart />
          </div>
          <div
            className={`lg:col-span-3 ${
              mobileTab === "ALL" || mobileTab === "BOOK" ? "block" : "hidden lg:block"
            }`}
          >
            <OrderBookPanel />
          </div>
          <div
            className={`lg:col-span-3 ${
              mobileTab === "ALL" || mobileTab === "TRADE" ? "block" : "hidden lg:block"
            }`}
          >
            <TradeTicketPanel />
          </div>
        </div>

        <PortfolioPositions />
      </main>

      <CommandPaletteModal />
    </div>
  );
}