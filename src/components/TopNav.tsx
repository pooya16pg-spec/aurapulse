"use client";

import React from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import {
  Activity,
  Bot,
  Command,
  Flame,
  Globe,
  Pause,
  Play,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

export default function TopNav() {
  const {
    lang,
    balanceUSD,
    assets,
    holdings,
    avgEntryPrices,
    selectedSymbol,
    isLiveStreamActive,
    isAutoBotActive,
    lastNotification,
    toggleLang,
    toggleLiveStream,
    toggleAutoBot,
    triggerMarketShock,
    setCommandOpen,
    setSelectedSymbol,
  } = useAuraStore();

  const symbols = Object.keys(holdings) as AssetSymbol[];

  const holdingsValue = symbols.reduce(
    (sum, sym) => sum + holdings[sym] * assets[sym].price,
    0
  );

  const totalCostBasis = symbols.reduce(
    (sum, sym) => sum + holdings[sym] * avgEntryPrices[sym],
    0
  );

  const unrealizedPnL = holdingsValue - totalCostBasis;
  const pnlPercent =
    totalCostBasis > 0 ? (unrealizedPnL / totalCostBasis) * 100 : 0;
  const totalNetWorth = balanceUSD + holdingsValue;

  return (
    <div dir={lang === "fa" ? "rtl" : "ltr"} className="z-40">
      {/* نوار تیکر زنده بازار */}
      <div className="bg-[#020306] border-b border-white/10 px-3 lg:px-8 py-1.5 text-[11px] font-mono">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              QUANTUM ENGINE v5.0
            </span>
            {symbols.map((sym) => {
              const a = assets[sym];
              const up = a.change24h >= 0;
              return (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md transition-all ${
                    selectedSymbol === sym
                      ? "bg-emerald-500/20 text-white border border-emerald-400/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="font-bold text-slate-100">{sym}</span>
                  <span>${a.price.toLocaleString("en-US")}</span>
                  <span className={up ? "text-emerald-400" : "text-rose-400"}>
                    {up ? "+" : ""}
                    {a.change24h}%
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hidden xl:flex items-center gap-4 text-slate-400 shrink-0">
            <span>Architect: Pooya Goodarzi</span>
            <span className="text-cyan-400">Execution: 0.3ms Zero-Slippage</span>
          </div>
        </div>
      </div>

      {/* هدر اصلی */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050811]/90 backdrop-blur-xl px-3 lg:px-8 py-3">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-indigo-500/20 border border-emerald-400/40 neon-border-emerald">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                    isLiveStreamActive ? "animate-ping" : ""
                  }`}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="font-mono font-extrabold tracking-wider text-white text-sm">
                AuraPulse
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                QUANT v5.0
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {lang === "fa"
                  ? "پویا گودرزی | معمار فول‌استک و UI/UX"
                  : "Pooya Goodarzi | Full-Stack & UI/UX Architect"}
              </span>
            </div>
          </div>

          {/* دکمه‌های کنترلی هدر */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-200 transition-all"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">
                {lang === "fa" ? "پالت فرمان" : "Command"}
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-cyan-300 rounded border border-white/10">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={toggleLiveStream}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isLiveStreamActive
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-500/15 border-amber-500/40 text-amber-300"
              }`}
            >
              {isLiveStreamActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>LIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>PAUSED</span>
                </>
              )}
            </button>

            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-mono transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === "fa" ? "EN" : "FA"}</span>
            </button>

            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-400/50 bg-slate-900 shrink-0 flex items-center justify-center">
              <img
                src="/aurapulse/assets/pooya-fintech.webp"
                alt="Pooya Goodarzi"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes("/aurapulse/assets/")) {
                    target.src = "/assets/pooya-fintech.webp";
                  } else {
                    target.style.display = "none";
                  }
                }}
              />
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </header>

      {/* بخش Hero Bento: کاملاً قابل مشاهده در اندروید و دسکتاپ + دکمه‌های شبیه‌ساز بازار */}
      <div className="max-w-[1680px] mx-auto px-3 lg:px-8 pt-4">
        <div className="glass-card rounded-2xl border border-white/15 p-3.5 lg:p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* کارت‌های دارایی و سود لحظه‌ای (همیشه نمایان روی موبایل و دسکتاپ) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
            <div className="p-2.5 rounded-xl bg-[#04070E]/90 border border-white/10">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === "fa" ? "ارزش کل پرتفوی" : "Total Net Worth"}</span>
              </div>
              <div className="font-mono font-extrabold text-sm sm:text-base text-white mt-1">
                $
                {totalNetWorth.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#04070E]/90 border border-white/10">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === "fa" ? "سود باز (Live PnL)" : "Unrealized PnL"}</span>
              </div>
              <div
                className={`font-mono font-bold text-sm sm:text-base mt-1 ${
                  unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {unrealizedPnL >= 0 ? "+" : ""}$
                {unrealizedPnL.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                <span className="text-[11px]">
                  ({pnlPercent >= 0 ? "+" : ""}
                  {pnlPercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#04070E]/90 border border-white/10">
              <div className="text-[11px] text-slate-400">
                {lang === "fa" ? "قدرت خرید نقد" : "Available Cash"}
              </div>
              <div className="font-mono font-bold text-sm sm:text-base text-cyan-400 mt-1">
                $
                {balanceUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#04070E]/90 border border-white/10">
              <div className="text-[11px] text-slate-400">
                {lang === "fa" ? "نسبت شارپ / وین‌ریت" : "Sharpe / Win-Rate"}
              </div>
              <div className="font-mono font-bold text-sm sm:text-base text-emerald-400 mt-1">
                3.48 • 84.2%
              </div>
            </div>
          </div>

          {/* نوار شبیه‌ساز تعاملی بازار و ربات تریدر خودکار */}
          <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/10">
            <button
              onClick={toggleAutoBot}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                isAutoBotActive
                  ? "bg-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                  : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-400/40"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>
                {isAutoBotActive
                  ? lang === "fa"
                    ? "ربات خودکار: فعال (ON)"
                    : "AI Auto-Bot: ON"
                  : lang === "fa"
                  ? "روشن کردن ربات تریدر AI"
                  : "Start AI Auto-Bot"}
              </span>
            </button>

            <button
              onClick={() => triggerMarketShock("PUMP")}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 font-mono text-xs font-semibold transition-all"
            >
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === "fa" ? "شبیه‌سازی پامپ نهنگ‌ها" : "Whale Bull Shock"}
              </span>
            </button>

            <button
              onClick={() => triggerMarketShock("CRASH")}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-200 font-mono text-xs font-semibold transition-all"
            >
              <Zap className="w-4 h-4 text-rose-400" />
              <span>
                {lang === "fa" ? "تست شوک ریزشی" : "Flash Crash Test"}
              </span>
            </button>
          </div>
        </div>

        {/* نوتیفیکیشن زنده عملیات */}
        {lastNotification && (
          <div className="mt-2.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs font-mono flex items-center justify-between">
            <span>{lastNotification}</span>
            <span className="text-[10px] text-emerald-400">REAL-TIME ENGINE</span>
          </div>
        )}
      </div>
    </div>
  );
}