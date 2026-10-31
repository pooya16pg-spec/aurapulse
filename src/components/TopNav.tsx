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
} from "lucide-react";

export default function TopNav() {
  const {
    lang,
    balanceUSD,
    assets,
    holdings,
    isLiveStreamActive,
    isBinanceConnected,
    toggleLang,
    toggleLiveStream,
    setCommandOpen,
  } = useAuraStore();

  const holdingsValue = (Object.keys(holdings) as AssetSymbol[]).reduce(
    (sum, sym) => sum + holdings[sym] * assets[sym].price,
    0
  );
  const totalNetWorth = balanceUSD + holdingsValue;

  return (
    <header
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="sticky top-0 z-40 border-b border-white/10 bg-carbon/95 backdrop-blur-xl px-3 sm:px-4 lg:px-8 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 sm:py-3"
    >
      <div className="max-w-[1600px] mx-auto grid grid-cols-[minmax(0,1fr)_auto] sm:flex sm:flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 min-w-0">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                  isLiveStreamActive ? "animate-ping" : ""
                }`}
              />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="font-mono font-bold tracking-wider text-white text-sm shrink-0">
              AuraPulse
            </span>
            <span className={`hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded border ${isBinanceConnected ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30" : "bg-amber-400/10 text-amber-200 border-amber-400/30"}`}>
              {isBinanceConnected ? "BINANCE FEED" : "SIMULATED"}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>
              {lang === "fa"
                ? "پورتفولیوی محصول و مهندسی • پویا گودرزی"
                : "Product & Engineering Portfolio • Pooya Goodarzi"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0 max-w-full justify-self-end bg-panel/90 border border-white/10 px-2.5 sm:px-4 py-2 sm:py-1.5 rounded-xl">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-xs text-slate-400">
              {lang === "fa" ? "ارزش حساب آزمایشی:" : "Account Equity:"}
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-white whitespace-nowrap">
              $
              {totalNetWorth.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="hidden sm:block h-4 w-[1px] bg-white/10" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">
              {lang === "fa" ? "موجودی نقد:" : "Cash Balance:"}
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

        <div className="col-span-2 sm:col-auto flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 min-w-0">
          <button
            onClick={() => setCommandOpen(true)}
            className="min-h-10 min-w-10 flex items-center justify-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-all"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">
              {lang === "fa" ? "فرمان سریع" : "Command"}
            </span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 rounded border border-white/10">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={toggleLiveStream}
            title={lang === "fa" ? "توقف یا ادامهٔ شبیه‌سازی محلی؛ دریافت قیمت بایننس ادامه دارد." : "Pause or resume the local demo simulator. Binance price polling continues."}
            className={`min-h-10 min-w-10 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-mono border transition-all ${
              isLiveStreamActive
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-amber-500/15 border-amber-500/40 text-amber-300"
            }`}
          >
            {isLiveStreamActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SIM ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SIM PAUSED</span>
              </>
            )}
          </button>

          <button
            onClick={toggleLang}
            className="min-h-10 min-w-10 flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-xs font-mono transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === "fa" ? "EN" : "فارسی"}</span>
          </button>

          <div className="hidden sm:flex w-9 h-9 rounded-xl overflow-hidden border border-emerald-400/40 bg-slate-900 shrink-0 items-center justify-center">
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
  );
}