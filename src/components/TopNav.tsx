"use client";

import React from "react";
import {
  useAuraStore,
  AssetSymbol,
  ActiveWorkspace,
  ThemePreset,
} from "../store/useAuraStore";
import SmartAssetImage from "./SmartAssetImage";
import {
  Bot,
  Command,
  Cpu,
  Flame,
  Globe,
  LayoutGrid,
  LineChart,
  Palette,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

export default function TopNav() {
  const {
    lang,
    theme,
    workspace,
    balanceUSD,
    assets,
    holdings,
    avgEntryPrices,
    selectedSymbol,
    isLiveStreamActive,
    isAutoBotActive,
    lastNotification,
    toggleLang,
    setTheme,
    setWorkspace,
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

  const WORKSPACES: {
    id: ActiveWorkspace;
    fa: string;
    en: string;
    icon: any;
  }[] = [
    {
      id: "TERMINAL",
      fa: "ترمینال معاملاتی کوانتوم",
      en: "Quantum Terminal",
      icon: LineChart,
    },
    {
      id: "HEATMAP",
      fa: "نقشه حرارتی و رادار بازار",
      en: "Market Heatmap",
      icon: LayoutGrid,
    },
    {
      id: "AILAB",
      fa: "آزمایشگاه هوش مصنوعی (AI Lab)",
      en: "AI Quant Lab",
      icon: Cpu,
    },
    {
      id: "ARCHITECT",
      fa: "معماری سیستم (پویا گودرزی)",
      en: "System Architecture",
      icon: ShieldCheck,
    },
  ];

  const THEMES: { id: ThemePreset; label: string; dot: string }[] = [
    { id: "EMERALD", label: "Cyber", dot: "bg-emerald-400" },
    { id: "PURPLE", label: "Nebula", dot: "bg-purple-400" },
    { id: "GOLD", label: "WallSt", dot: "bg-amber-400" },
  ];

  return (
    <div dir={lang === "fa" ? "rtl" : "ltr"} className="z-40">
      {/* نوار تیکر زنده نئونی */}
      <div className="bg-[#010204] border-b border-white/10 px-3 lg:px-8 py-1.5 text-[11px] font-mono">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              QUANTUM ENGINE v9.0
            </span>
            {symbols.map((sym) => {
              const a = assets[sym];
              const up = a.change24h >= 0;
              const active = selectedSymbol === sym;
              return (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    active ? "btn-cyber-active" : "btn-cyber"
                  }`}
                >
                  <span className="font-bold">{sym}</span>
                  <span>${a.price.toLocaleString("en-US")}</span>
                  <span
                    className={
                      active
                        ? "text-slate-950 font-extrabold"
                        : up
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {up ? "+" : ""}
                    {a.change24h}%
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hidden xl:flex items-center gap-4 text-slate-400 shrink-0">
            <span className="text-cyan-300">Vector HD 144Hz</span>
            <span>Architect: Pooya Goodarzi</span>
          </div>
        </div>
      </div>

      {/* هدر اصلی */}
      <header className="sticky top-0 z-40 border-b border-white/15 bg-[#040711]/90 backdrop-blur-2xl px-3 lg:px-8 py-3">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-cyan-500/20 to-indigo-500/25 border border-emerald-400/50 cyber-card-glow">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span className="font-mono font-black tracking-wider text-white text-base">
                AuraPulse
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 font-bold">
                PRO v9.0
              </span>
            </div>

            {/* کارت پروفایل پویا گودرزی با سایز دقیق و قفل‌شده 42x42 پیکسل */}
            <button
              onClick={() => setWorkspace("ARCHITECT")}
              className="btn-cyber flex items-center gap-2.5 px-3 py-1.5 rounded-2xl text-xs"
            >
              <div
                style={{ width: 42, height: 42, minWidth: 42, maxWidth: 42 }}
                className="relative rounded-xl overflow-hidden border-2 border-emerald-400/80 bg-slate-900 shrink-0 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.45)]"
              >
                <SmartAssetImage
                  baseName="pooya-fintech"
                  alt="Pooya Goodarzi"
                  className="w-full h-full object-cover object-top"
                  style={{
                    width: "42px",
                    height: "42px",
                    objectFit: "cover",
                    objectPosition: "top center",
                  }}
                  fallback={
                    <span className="font-mono font-black text-xs text-emerald-300">
                      PG
                    </span>
                  }
                />
              </div>
              <div className="text-start">
                <div className="font-bold text-white leading-tight flex items-center gap-1.5">
                  <span>{lang === "fa" ? "پویا گودرزی" : "Pooya Goodarzi"}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-cyan-300 font-mono">
                  {lang === "fa"
                    ? "معمار سیستم و طراح UI/UX"
                    : "Lead System Architect"}
                </div>
              </div>
            </button>
          </div>

          {/* انتخابگر تم رنگی + کنترل‌های سیستم */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-[#020408] border border-cyan-500/25 text-[11px] font-mono">
              <Palette className="w-3.5 h-3.5 text-cyan-400 mx-1" />
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    theme === t.id ? "btn-cyber-active" : "btn-cyber"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCommandOpen(true)}
              className="btn-cyber flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            >
              <Command className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {lang === "fa" ? "پالت فرمان" : "Command"}
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-cyan-300 rounded border border-cyan-500/30">
                Ctrl+K
              </kbd>
            </button>

            <button
              onClick={toggleLiveStream}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                isLiveStreamActive ? "btn-cyber-active" : "btn-cyber-danger"
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
              className="btn-cyber-purple flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-300" />
              <span>{lang === "fa" ? "EN" : "FA"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* داشبورد فرماندهی فضایی */}
      <div className="max-w-[1720px] mx-auto px-3 lg:px-8 pt-4 space-y-3">
        {/* نوار سوییچ ۴ محیط کاری */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#040711]/95 border border-white/15">
          {WORKSPACES.map((ws) => {
            const Icon = ws.icon;
            const active = workspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => setWorkspace(ws.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  active ? "btn-cyber-active" : "btn-cyber"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {lang === "fa" ? ws.fa : ws.en}
                </span>
              </button>
            );
          })}
        </div>

        {/* کارت هولوگرافیک آمار پرتفوی با واترمارک محو هولوگرام در پس‌زمینه */}
        <div className="cyber-card relative overflow-hidden rounded-2xl border border-white/15 p-3.5 lg:p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1 relative z-10">
            <div className="p-3 rounded-xl bg-[#03060C]/90 border border-emerald-500/30">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {lang === "fa" ? "ارزش کل پرتفوی" : "Total Net Worth"}
                </span>
              </div>
              <div className="font-mono font-black text-base sm:text-lg text-white mt-1">
                $
                {totalNetWorth.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                ● INSTITUTIONAL TIER
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#03060C]/90 border border-cyan-500/30">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {lang === "fa" ? "سود خالص لحظه‌ای" : "Unrealized PnL"}
                </span>
              </div>
              <div
                className={`font-mono font-black text-base sm:text-lg mt-1 ${
                  unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {unrealizedPnL >= 0 ? "+" : ""}$
                {unrealizedPnL.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </div>
              <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                ROE: {pnlPercent >= 0 ? "+" : ""}
                {pnlPercent.toFixed(2)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#03060C]/90 border border-white/15">
              <div className="text-[11px] text-slate-400">
                {lang === "fa" ? "قدرت خرید نقد (USD)" : "Available Margin"}
              </div>
              <div className="font-mono font-black text-base sm:text-lg text-cyan-400 mt-1">
                $
                {balanceUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                Leverage Up To 25x
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#03060C]/90 border border-purple-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {lang === "fa" ? "موتور سیگنال AI" : "AI Neural Confidence"}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-end justify-between mt-1.5">
                <div>
                  <div className="font-mono font-black text-base sm:text-lg text-purple-300">
                    94.8%
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    Sharpe: 3.48
                  </div>
                </div>
                <div className="flex items-end gap-1 h-7">
                  <span className="w-1.5 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="w-1.5 h-5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="w-1.5 h-7 rounded-full bg-purple-400 animate-pulse" />
                  <span className="w-1.5 h-6 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="w-1.5 h-7 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* شبیه‌سازهای تعاملی بازار با دکمه‌های نئونی مدرن */}
          <div className="flex flex-wrap items-center gap-2 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/10 relative z-10">
            <button
              onClick={toggleAutoBot}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                isAutoBotActive ? "btn-cyber-active" : "btn-cyber-purple"
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
              className="btn-cyber flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold"
            >
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === "fa" ? "موج خرید نهنگ‌ها (+Pump)" : "Whale Bull Pump"}
              </span>
            </button>

            <button
              onClick={() => triggerMarketShock("CRASH")}
              className="btn-cyber-danger flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold"
            >
              <Zap className="w-4 h-4 text-rose-300" />
              <span>
                {lang === "fa" ? "شوک ریزشی (-Crash)" : "Flash Crash"}
              </span>
            </button>
          </div>
        </div>

        {lastNotification && (
          <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 text-emerald-100 text-xs font-mono flex items-center justify-between">
            <span>{lastNotification}</span>
            <span className="text-[10px] text-cyan-300 font-bold">
              QUANT TELEMETRY
            </span>
          </div>
        )}
      </div>
    </div>
  );
}