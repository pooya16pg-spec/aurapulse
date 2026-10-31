"use client";

import React, { useEffect, useState } from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import { Command, Search, X, Zap, Globe, Activity } from "lucide-react";

export default function CommandPaletteModal() {
  const {
    lang,
    isCommandOpen,
    setCommandOpen,
    setSelectedSymbol,
    executeOrder,
    toggleLang,
    toggleLiveStream,
  } = useAuraStore();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!isCommandOpen);
      } else if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandOpen, setCommandOpen]);

  if (!isCommandOpen) return null;

  const actions = [
    {
      id: "btc",
      label:
        lang === "fa"
          ? "سوییچ نمودار به بیت‌کوین (BTC/USD)"
          : "Switch Chart to BTC/USD",
      icon: Activity,
      run: () => setSelectedSymbol("BTC/USD" as AssetSymbol),
    },
    {
      id: "nvda",
      label:
        lang === "fa"
          ? "سوییچ نمودار به سهام انویدیا (NVDA/AI)"
          : "Switch Chart to NVIDIA (NVDA/AI)",
      icon: Activity,
      run: () => setSelectedSymbol("NVDA/AI" as AssetSymbol),
    },
    {
      id: "quick-buy",
      label:
        lang === "fa"
          ? "خرید سریع ۱,۰۰۰ دلاری روی نماد فعال"
          : "Instant Buy $1,000 on Active Symbol",
      icon: Zap,
      run: () => executeOrder("BUY", 1000),
    },
    {
      id: "stream",
      label:
        lang === "fa"
          ? "توقف / شروع استریم لحظه‌ای قیمت‌ها"
          : "Toggle Live Market Data Stream",
      icon: Command,
      run: () => toggleLiveStream(),
    },
    {
      id: "lang",
      label:
        lang === "fa"
          ? "تغییر زبان سیستم به انگلیسی (EN)"
          : "Switch Interface Language to Persian (FA)",
      icon: Globe,
      run: () => toggleLang(),
    },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        className="w-full max-w-lg rounded-2xl bg-panel border border-white/15 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === "fa"
                ? "جستجوی دستور مهندسی یا نماد بازار..."
                : "Type a command or search symbol..."
            }
            className="flex-1 bg-transparent text-xs text-white focus:outline-none"
          />
          <button
            onClick={() => setCommandOpen(false)}
            className="p-1 rounded-lg bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  act.run();
                  setCommandOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-500/15 text-xs text-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{act.label}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Enter ↵
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}