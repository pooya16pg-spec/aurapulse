"use client";

import React, { useEffect } from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import TopNav from "../components/TopNav";
import LiveCanvasChart from "../components/LiveCanvasChart";
import OrderBookPanel from "../components/OrderBookPanel";
import TradeTicketPanel from "../components/TradeTicketPanel";
import PortfolioPositions from "../components/PortfolioPositions";
import CommandPaletteModal from "../components/CommandPaletteModal";
import {
  Cpu,
  ExternalLink,
  Flame,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
} from "lucide-react";

export default function AuraPulseTerminalPage() {
  const {
    tickMarket,
    lang,
    theme,
    workspace,
    assets,
    selectedSymbol,
    setSelectedSymbol,
    setWorkspace,
    aiLogs,
    triggerMarketShock,
  } = useAuraStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickMarket();
    }, 1400);
    return () => clearInterval(interval);
  }, [tickMarket]);

  const themeClass =
    theme === "PURPLE"
      ? "spatial-bg-purple"
      : theme === "GOLD"
      ? "spatial-bg-gold"
      : "spatial-bg-emerald";

  const symbols = Object.keys(assets) as AssetSymbol[];

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col`}>
      <TopNav />

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 lg:px-8 py-4 space-y-5 min-w-0">
        {/* محیط کاری ۱: ترمینال معاملاتی اصلی */}
        {workspace === "TERMINAL" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-6 min-w-0">
                <LiveCanvasChart />
              </div>
              <div className="lg:col-span-3 min-w-0">
                <OrderBookPanel />
              </div>
              <div className="lg:col-span-3 min-w-0">
                <TradeTicketPanel />
              </div>
            </div>
            <PortfolioPositions />
          </>
        )}

        {/* محیط کاری ۲: نقشه حرارتی بازار (Market Heatmap) */}
        {workspace === "HEATMAP" && (
          <div
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="cyber-card rounded-2xl border border-white/15 p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  {lang === "fa"
                    ? "نقشه حرارتی زنده نقدینگی و جریان پول هوشمند (Institutional Heatmap)"
                    : "Real-Time Institutional Market Heatmap"}
                </h2>
              </div>
              <span className="text-xs font-mono text-cyan-300">
                Click any tile to open in Quantum Terminal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {symbols.map((sym) => {
                const a = assets[sym];
                const up = a.change24h >= 0;
                return (
                  <div
                    key={sym}
                    onClick={() => {
                      setSelectedSymbol(sym);
                      setWorkspace("TERMINAL");
                    }}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                      up
                        ? "bg-gradient-to-br from-emerald-500/25 via-[#050B14] to-cyan-500/15 border-emerald-400/50"
                        : "bg-gradient-to-br from-rose-500/25 via-[#050B14] to-amber-500/15 border-rose-400/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-lg text-white">
                        {sym}
                      </span>
                      <span
                        className={`font-mono text-xs px-2.5 py-1 rounded-full font-bold ${
                          up
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {up ? "+" : ""}
                        {a.change24h}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      {a.name[lang]}
                    </div>
                    <div className="text-[11px] text-cyan-300 mt-0.5">
                      {a.sector[lang]}
                    </div>

                    <div className="text-2xl font-mono font-black text-white mt-4">
                      ${a.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-400 block">24h Vol</span>
                        <span className="text-white font-bold">{a.volume24h}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Whale Score</span>
                        <span className="text-emerald-400 font-bold">
                          {a.whaleScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <PortfolioPositions />
          </div>
        )}

        {/* محیط کاری ۳: آزمایشگاه هوش مصنوعی و بک‌تست (AI Quant Lab) */}
        {workspace === "AILAB" && (
          <div
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
            <div className="lg:col-span-7 cyber-card rounded-2xl border border-white/15 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">
                    {lang === "fa"
                      ? "موتور بک‌تست مونت‌کارلو و تحلیل شبکه عصبی"
                      : "Neural Monte-Carlo Strategy Backtester"}
                  </h2>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  10,000 SIMULATIONS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-4 rounded-xl bg-[#020408] border border-white/10">
                  <div className="text-xs text-slate-400">Expected Annual Return</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    +142.8%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    vs +38.4% S&P/BTC Benchmark
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#020408] border border-white/10">
                  <div className="text-xs text-slate-400">Profit Factor</div>
                  <div className="text-xl font-black text-cyan-400 mt-1">
                    2.94x
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Win Rate: 84.2% (High Freq)
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#020408] border border-white/10">
                  <div className="text-xs text-slate-400">Value at Risk (99% VaR)</div>
                  <div className="text-xl font-black text-purple-300 mt-1">
                    1.18%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Dynamic Kelly Criterion
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => triggerMarketShock("PUMP")}
                  className="px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-mono text-xs font-bold"
                >
                  {lang === "fa"
                    ? "اجرای تست استرس صعودی روی مدل AI"
                    : "Run Bullish Stress Simulation"}
                </button>
                <button
                  onClick={() => setWorkspace("TERMINAL")}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold"
                >
                  {lang === "fa"
                    ? "بازگشت به چارت زنده"
                    : "Return to Live Chart"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 cyber-card rounded-2xl border border-white/15 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === "fa"
                      ? "ترمینال زنده تصمیمات هوش مصنوعی (AI Telemetry)"
                      : "Live Neural Execution Telemetry"}
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-cyan-400">STREAMING</span>
              </div>
              <div
                dir="ltr"
                className="space-y-2 font-mono text-xs bg-[#020408] p-3.5 rounded-xl border border-white/10 max-h-[260px] overflow-y-auto"
              >
                {aiLogs.map((log, i) => (
                  <div key={i} className="text-emerald-300/90 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* محیط کاری ۴: شناسنامه معماری مهندسی پویا گودرزی */}
        {workspace === "ARCHITECT" && (
          <div
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="cyber-card rounded-2xl border border-emerald-400/40 p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  FLAGSHIP PORTFOLIO PROJECT #2
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-2">
                  {lang === "fa"
                    ? "معماری مهندسی AuraPulse — طراحی و توسعه توسط پویا گودرزی"
                    : "AuraPulse System Architecture — Engineered by Pooya Goodarzi"}
                </h2>
              </div>
              <a
                href="https://pooya16pg-spec.github.io/pooya-os/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-xs"
              >
                <span>
                  {lang === "fa"
                    ? "مشاهده پروژه اول (سیستم‌عامل فضایی Pooya.OS)"
                    : "Launch Project #1: Pooya.OS"}
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#020408]/90 border border-white/10 space-y-2">
                <div className="text-cyan-400 font-mono font-bold text-xs">
                  01 / PURE SVG VECTOR CHART ENGINE
                </div>
                <h3 className="text-sm font-bold text-white">
                  {lang === "fa"
                    ? "موتور گرافیک برداری بدون افت کیفیت در زوم و موبایل"
                    : "Resolution-Independent SVG Charting"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "fa"
                    ? "رندرینگ هم‌زمان کندل‌استیک‌های OHLC، کانال باندهای بولینگر، میانگین متحرک EMA-9/21 و اسیلاتور RSI بدون وابستگی به کتابخانه‌های آماده."
                    : "Custom-built zero-dependency SVG financial charting engine with Bollinger Bands, dual EMA overlays, and RSI oscillator."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#020408]/90 border border-white/10 space-y-2">
                <div className="text-emerald-400 font-mono font-bold text-xs">
                  02 / REACTIVE QUANT STATE MACHINE
                </div>
                <h3 className="text-sm font-bold text-white">
                  {lang === "fa"
                    ? "ماشین حالت بلادرنگ و اجرای سفارشات با تاخیر صفر"
                    : "Sub-Millisecond Optimistic Order Matching"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "fa"
                    ? "محاسبه آنی سود و زیان (Unrealized PnL)، قیمت لیکویید شدن اهرمی (1x تا 25x)، دفتر سفارشات L2 و ربات معامله‌گر خودکار."
                    : "Real-time L2 order book depth generation, leveraged liquidation math, and autonomous AI trading bot simulation."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#020408]/90 border border-white/10 space-y-2">
                <div className="text-purple-400 font-mono font-bold text-xs">
                  03 / SPATIAL FINTECH UI/UX SYSTEM
                </div>
                <h3 className="text-sm font-bold text-white">
                  {lang === "fa"
                    ? "سیستم طراحی چندپوسته‌ای و کیبورد محور"
                    : "Multi-Theme Spatial Design System"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === "fa"
                    ? "مجهز به ۳ تم رنگی زنده (Cyber / Nebula / WallSt)، پالت فرمان سریع (Ctrl+K)، پشتیبانی دوزبانه (FA/EN) و واکنش‌گرایی کامل در اندروید و ویندوز."
                    : "Features 3 live institutional color themes, keyboard-first Command Palette (Ctrl+K), and adaptive RTL/LTR layouts."}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <CommandPaletteModal />
    </div>
  );
}