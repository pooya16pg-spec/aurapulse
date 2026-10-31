"use client";

import React, { useEffect } from "react";
import { useAuraStore, AssetSymbol, BinanceMarketUpdate } from "../store/useAuraStore";
import TopNav from "../components/TopNav";
import LiveCanvasChart from "../components/LiveCanvasChart";
import OrderBookPanel from "../components/OrderBookPanel";
import TradeTicketPanel from "../components/TradeTicketPanel";
import PortfolioPositions from "../components/PortfolioPositions";
import CommandPaletteModal from "../components/CommandPaletteModal";
import SmartAssetImage from "../components/SmartAssetImage";
import { Cpu, ExternalLink, Flame, Terminal } from "lucide-react";

type BinanceTickerRow = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  quoteVolume: string;
};

export default function AuraPulseTerminalPage() {
  const {
    tickMarket,
    lang,
    theme,
    workspace,
    assets,
    setSelectedSymbol,
    setWorkspace,
    aiLogs,
    triggerMarketShock,
    applyBinanceTickerData,
    setBinanceConnected,
    hydratePaperAccount,
    isBinanceConnected,
  } = useAuraStore();

  // Public Binance 24h tickers are read-only; order placement remains local paper trading.
  useEffect(() => {
    hydratePaperAccount();
    let active = true;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;

    const fetchMarketData = async () => {
      controller = new AbortController();
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22SOLUSDT%22%5D",
          { signal: controller.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Binance returned HTTP ${res.status}`);

        const rows = (await res.json()) as BinanceTickerRow[];
        const updates: Partial<Record<AssetSymbol, BinanceMarketUpdate>> = {};
        rows.forEach((row) => {
          const mapping: Record<string, AssetSymbol> = {
            BTCUSDT: "BTC/USD",
            ETHUSDT: "ETH/USD",
            SOLUSDT: "SOL/USD",
          };
          const symbol = mapping[row.symbol];
          const price = Number(row.lastPrice);
          const change24h = Number(row.priceChangePercent);
          const high24h = Number(row.highPrice);
          const low24h = Number(row.lowPrice);
          const quoteVolume = Number(row.quoteVolume);
          if (
            symbol &&
            Number.isFinite(price) && price > 0 &&
            Number.isFinite(change24h) &&
            Number.isFinite(high24h) && Number.isFinite(low24h)
          ) {
            updates[symbol] = {
              price,
              change24h,
              high24h,
              low24h,
              volume24h: Number.isFinite(quoteVolume)
                ? `${quoteVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                : "—",
            };
          }
        });

        if (active) {
          if (Object.keys(updates).length > 0) applyBinanceTickerData(updates);
          else setBinanceConnected(false);
        }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setBinanceConnected(false);
        }
      } finally {
        if (active) pollTimer = setTimeout(fetchMarketData, 10000);
      }
    };

    void fetchMarketData();
    const simulationTimer = setInterval(tickMarket, 1400);
    return () => {
      active = false;
      controller?.abort();
      if (pollTimer) clearTimeout(pollTimer);
      clearInterval(simulationTimer);
    };
  }, [tickMarket, applyBinanceTickerData, setBinanceConnected, hydratePaperAccount]);

  const themeClass =
    theme === "PURPLE"
      ? "spatial-bg-purple"
      : theme === "GOLD"
      ? "spatial-bg-gold"
      : "spatial-bg-emerald";

  const symbols = Object.keys(assets) as AssetSymbol[];

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col overflow-x-hidden`}>
      <TopNav />

      <main className="flex-1 max-w-[1720px] w-full mx-auto px-2.5 sm:px-4 lg:px-8 py-4 space-y-5 min-w-0">
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
                    ? "نقشه بازار و نمایش وضعیت داده‌های آزمایشی"
                    : "Market Data & Paper-Trading Heatmap"}
                </h2>
              </div>
              <span className="text-xs font-mono text-cyan-300">
                {isBinanceConnected
                  ? "BINANCE LIVE: BTC / ETH / SOL • NVDA/AI: SYNTHETIC"
                  : "SIMULATED FALLBACK • WAITING FOR BINANCE"}
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
                    <div className="text-2xl font-mono font-black text-white mt-4">
                      ${a.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}
            </div>
            <PortfolioPositions />
          </div>
        )}

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
                  PAPER TRADING ENGINE
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => triggerMarketShock("PUMP")}
                  className="btn-cyber-active px-4 py-2.5 rounded-xl font-mono text-xs font-bold"
                >
                  {lang === "fa"
                    ? "اجرای تست استرس صعودی"
                    : "Run Bullish Stress Simulation"}
                </button>
                <button
                  onClick={() => setWorkspace("TERMINAL")}
                  className="btn-cyber px-4 py-2.5 rounded-xl font-mono text-xs font-bold"
                >
                  {lang === "fa"
                    ? "بازگشت به داشبورد بازار"
                    : "Return to Market Dashboard"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 cyber-card rounded-2xl border border-white/15 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === "fa"
                      ? "گزارش فعالیت شبیه‌ساز محلی"
                      : "Local Simulator Activity"}
                  </h3>
                </div>
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

        {workspace === "ARCHITECT" && (
          <div
            dir={lang === "fa" ? "rtl" : "ltr"}
            className="cyber-card rounded-2xl border border-emerald-400/40 p-5 sm:p-6 space-y-6 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 border-b border-white/10 pb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div
                  style={{ width: 88, height: 88, minWidth: 88, maxWidth: 88 }}
                  className="rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg bg-slate-900 shrink-0 flex items-center justify-center"
                >
                  <SmartAssetImage
                    baseName="pooya-fintech"
                    alt="Pooya Goodarzi"
                    style={{
                      width: "88px",
                      height: "88px",
                      objectFit: "cover",
                      objectPosition: "top center",
                    }}
                    fallback={
                      <span className="font-mono font-black text-2xl text-emerald-400">
                        PG
                      </span>
                    }
                  />
                </div>
                <div className="text-center sm:text-start min-w-0">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    LEAD SYSTEM ARCHITECT • PORTFOLIO #2
                  </span>
                  <h2 className="text-lg md:text-2xl font-black text-white mt-2">
                    {lang === "fa"
                      ? "پویا گودرزی — مهندس کامپیوتر و معمار سیستم‌های فین‌تک"
                      : "Pooya Goodarzi — Computer Engineer & FinTech Architect"}
                  </h2>
                </div>
              </div>

              <a
                href="https://pooya16pg-spec.github.io/pooya-os/"
                target="_blank"
                rel="noreferrer"
                className="btn-cyber-active flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shrink-0"
              >
                <span>
                  {lang === "fa"
                    ? "مشاهده پروژه اول (Pooya.OS)"
                    : "Launch Project #1: Pooya.OS"}
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>

      <CommandPaletteModal />
    </div>
  );
}