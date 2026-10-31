"use client";

import React from "react";
import { useAuraStore } from "../store/useAuraStore";
import { BookOpen, Sparkles } from "lucide-react";

export default function OrderBookPanel() {
  const {
    lang,
    selectedSymbol,
    assets,
    setSelectedOrderBookPrice,
  } = useAuraStore();

  const activeAsset = assets[selectedSymbol];
  const spread =
    activeAsset.asks.length > 0 && activeAsset.bids.length > 0
      ? Math.abs(
          activeAsset.asks[activeAsset.asks.length - 1].price -
            activeAsset.bids[0].price
        ).toFixed(2)
      : "0.50";

  const buyPressure = activeAsset.whaleScore;
  const sellPressure = 100 - buyPressure;

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="cyber-card rounded-2xl border border-white/15 p-4 flex flex-col justify-between h-full space-y-3 min-w-0"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white">
            {lang === "fa"
              ? "عمق نقدینگی و دفتر سفارشات (L2 Depth)"
              : "L2 Order Book & Pressure"}
          </h3>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-cyan-400/20">
          {lang === "fa" ? "شبیه‌سازی‌شده" : "SIMULATED"}
        </span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-cyan-400/20">
          {selectedSymbol}
        </span>
      </div>

      {/* Illustrative demo buy/sell bias, not live whale-flow data. */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">
            Demo Buy {buyPressure}%
          </span>
          <span className="text-rose-400 font-bold">
            Demo Sell {sellPressure}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-rose-500/30 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${buyPressure}%` }}
          />
        </div>
      </div>

      <div
        dir="ltr"
        className="grid grid-cols-3 text-[10px] font-mono text-slate-500 pb-1 border-b border-white/5"
      >
        <span>PRICE (USD)</span>
        <span className="text-right">SIZE</span>
        <span className="text-right">SUM</span>
      </div>

      {/* فروشندگان (Asks) */}
      <div dir="ltr" className="space-y-1 font-mono text-[11px]">
        {activeAsset.asks.map((ask, idx) => (
          <button
            key={`ask-${idx}`}
            onClick={() => setSelectedOrderBookPrice(ask.price)}
            className="relative w-full grid grid-cols-3 items-center py-1 px-2 rounded overflow-hidden hover:bg-white/10 transition-colors text-left"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-rose-500/20 pointer-events-none transition-all duration-300"
              style={{ width: `${ask.depthPercent}%` }}
            />
            <span className="relative z-10 text-rose-400 font-bold">
              {ask.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="relative z-10 text-right text-slate-200">
              {ask.size.toFixed(3)}
            </span>
            <span className="relative z-10 text-right text-slate-500">
              {ask.total.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* قیمت میانی */}
      <div
        dir="ltr"
        className="py-2 px-3 rounded-xl bg-[#020408] border border-white/15 flex items-center justify-between font-mono"
      >
        <span className="text-sm font-black text-white">
          ${activeAsset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-[10px] text-cyan-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Spread: ${spread}
        </span>
      </div>

      {/* خریداران (Bids) */}
      <div dir="ltr" className="space-y-1 font-mono text-[11px]">
        {activeAsset.bids.map((bid, idx) => (
          <button
            key={`bid-${idx}`}
            onClick={() => setSelectedOrderBookPrice(bid.price)}
            className="relative w-full grid grid-cols-3 items-center py-1 px-2 rounded overflow-hidden hover:bg-white/10 transition-colors text-left"
          >
            <div
              className="absolute right-0 top-0 bottom-0 bg-emerald-500/20 pointer-events-none transition-all duration-300"
              style={{ width: `${bid.depthPercent}%` }}
            />
            <span className="relative z-10 text-emerald-400 font-bold">
              {bid.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span className="relative z-10 text-right text-slate-200">
              {bid.size.toFixed(3)}
            </span>
            <span className="relative z-10 text-right text-slate-500">
              {bid.total.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}