"use client";

import React from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import {
  Activity,
  Command,
  Globe,
  Pause,
  Play,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Cpu,
  Gauge,
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
    toggleLang,
    toggleLiveStream,
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
  const pnlPercent = totalCostBasis > 0 ? (unrealizedPnL / totalCostBasis) * 100 : 0;
  const totalNetWorth = balanceUSD + holdingsValue;

  return (
    <div dir={lang === "fa" ? "rtl" : "ltr"} className="sticky top-0 z-40">
      {/* نوار تیکر زنده بازار در بالاترین بخش */}
      <div className="bg-[#030508] border-b border-white/10 px-4 lg:px-8 py-1.5 text-[11px] font-mono">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-5 shrink-0">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              QUANT ENGINE: 144Hz
            </span>
            {symbols.map((sym) => {
              const a = assets[sym];
              const up = a.change24h >= 0;
              return (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
                    selectedSymbol === sym
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="font-bold text-slate-200">{sym}</span>
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
            <span>WS Feed: wss://quant.aurapulse.io/v3</span>
            <span className="text-cyan-400">Latency: 0.4ms</span>
          </div>
        </div>
      </div>

      {/* هدر اصلی */}
      <header className="border-b border-white/10 bg-[#05080F]/90 backdrop-blur-xl px-4 lg:px-8 py-3">
        <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                    isLiveStreamActive ? "animate-ping" : ""
                  }`}
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="font-mono font-bold tracking-wider text-white text-sm">
                AuraPulse
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                PRO v3.5
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === "fa"
                  ? "معمار سیستم و طراح UI/UX: پویا گودرزی"
                  : "System Architect & UI/UX: Pooya Goodarzi"}
              </span>
            </div>
          </div>

          {/* متریک‌های کلیدی در هدر */}
          <div className="hidden lg:flex items-center gap-5 bg-[#0A0F1A] border border-white/10 px-4 py-1.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">
                {lang === "fa" ? "ارزش کل پرتفوی:" : "Net Worth:"}
              </span>
              <span className="font-mono font-bold text-sm text-white">
                $
                {totalNetWorth.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">
                {lang === "fa" ? "سود باز (PnL):" : "Unrealized PnL:"}
              </span>
              <span
                className={`font-mono font-bold ${
                  unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {unrealizedPnL >= 0 ? "+" : ""}$
                {unrealizedPnL.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ({pnlPercent >= 0 ? "+" : ""}
                {pnlPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">
                {lang === "fa" ? "قدرت خرید نقد:" : "Free Margin:"}
              </span>
              <span className="font-mono text-cyan-400 font-semibold">
                $
                {balanceUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* کنترل‌ها */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {lang === "fa" ? "پالت فرمان" : "Command"}
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-cyan-300 rounded border border-white/10">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={toggleLiveStream}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                isLiveStreamActive
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-500/15 border-amber-500/40 text-amber-300"
              }`}
            >
              {isLiveStreamActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">STREAMING</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PAUSED</span>
                </>
              )}
            </button>

            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-mono transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === "fa" ? "EN" : "فارسی"}</span>
            </button>

            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-400/50 bg-slate-900 shrink-0 flex items-center justify-center relative">
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

      {/* نوار متریک‌های کوانتومی زیر هدر */}
      <div className="bg-[#060911]/90 border-b border-white/5 px-4 lg:px-8 py-2">
        <div className="max-w-[1680px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              {lang === "fa" ? "نسبت شارپ پرتفوی:" : "Portfolio Sharpe Ratio:"}
            </span>
            <span className="font-mono font-bold text-emerald-400">3.42 (Institutional)</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              {lang === "fa" ? "آلفای الگوریتمی ۲۴ ساعت:" : "24h Quant Alpha:"}
            </span>
            <span className="font-mono font-bold text-cyan-400">+2.84% vs Benchmark</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-slate-400">
              {lang === "fa" ? "حداکثر افت سرمایه (Max DD):" : "Max Drawdown (30d):"}
            </span>
            <span className="font-mono font-bold text-slate-200">-1.65% (Low Risk)</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-slate-400">
              {lang === "fa" ? "وضعیت موتور رندرینگ:" : "Canvas Render Engine:"}
            </span>
            <span className="font-mono font-bold text-emerald-400">Zero-Lag OHLC + EMA9</span>
          </div>
        </div>
      </div>
    </div>
  );
}