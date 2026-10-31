"use client";

import React, { useState } from "react";
import { useAuraStore } from "../store/useAuraStore";
import {
  ArrowDownUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
} from "lucide-react";

const LEVERAGES = [1, 2, 5, 10, 25];

export default function TradeTicketPanel() {
  const {
    lang,
    selectedSymbol,
    selectedOrderBookPrice,
    assets,
    balanceUSD,
    holdings,
    executeOrder,
    setSelectedOrderBookPrice,
  } = useAuraStore();

  const activeAsset = assets[selectedSymbol];
  const userUnits = holdings[selectedSymbol];

  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [leverage, setLeverage] = useState<number>(5);
  const [usdInput, setUsdInput] = useState<string>("2500");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const effectivePrice = selectedOrderBookPrice || activeAsset.price;
  const numericUSD = parseFloat(usdInput) || 0;
  const buyingPowerUSD = side === "BUY" ? numericUSD * leverage : numericUSD;
  const estimatedUnits = (buyingPowerUSD / effectivePrice).toFixed(4);

  const liquidationPrice =
    leverage > 1
      ? side === "BUY"
        ? (effectivePrice * (1 - 0.9 / leverage)).toFixed(2)
        : (effectivePrice * (1 + 0.9 / leverage)).toFixed(2)
      : null;

  const handlePercentage = (pct: number) => {
    if (side === "BUY") {
      setUsdInput(Math.floor((balanceUSD * pct) / 100).toString());
    } else {
      const maxSellUSD = userUnits * effectivePrice;
      setUsdInput(Math.floor((maxSellUSD * pct) / 100).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = executeOrder(side, numericUSD, leverage);
    if (success) {
      setFeedback({
        ok: true,
        msg:
          lang === "fa"
            ? `سفارش ${side === "BUY" ? "خرید" : "فروش"} ${estimatedUnits} واحد (${leverage}x) در موتور کوانتومی ثبت شد.`
            : `Filled ${side} ${estimatedUnits} ${selectedSymbol} (${leverage}x) instantaneously.`,
      });
    } else {
      setFeedback({
        ok: false,
        msg:
          lang === "fa"
            ? "موجودی کافی برای انجام این تراکنش وجود ندارد."
            : "Insufficient margin or holdings for this order.",
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="space-y-4 flex flex-col justify-between h-full"
    >
      {/* کارت ثبت سفارش حرفه‌ای */}
      <div className="glass-card rounded-2xl border border-white/10 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === "fa"
                ? "موتور اجرای سفارشات کوانتومی"
                : "Quant Order Execution"}
            </span>
          </h3>
          {selectedOrderBookPrice && (
            <button
              onClick={() => setSelectedOrderBookPrice(null)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
            >
              Limit: ${selectedOrderBookPrice} ✕
            </button>
          )}
        </div>

        {/* تب خرید و فروش */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#04060A] border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === "BUY"
                ? "bg-emerald-500 text-slate-950 shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {lang === "fa" ? "خرید تعهدی (LONG)" : "LONG / BUY"}
          </button>
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === "SELL"
                ? "bg-rose-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {lang === "fa" ? "فروش تعهدی (SHORT)" : "SHORT / SELL"}
          </button>
        </div>

        {/* انتخابگر اهرم معاملاتی (Leverage) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              {lang === "fa" ? "اهرم معاملاتی (Leverage):" : "Margin Leverage:"}
            </span>
            <span className="font-mono font-bold text-cyan-400">{leverage}x</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
            {LEVERAGES.map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => setLeverage(lev)}
                className={`py-1 rounded-lg border transition-all ${
                  leverage === lev
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>
                {lang === "fa" ? "مارجین ورودی (USD):" : "Collateral Margin (USD):"}
              </span>
              <span className="font-mono text-slate-300">
                {side === "BUY"
                  ? `Avail: $${balanceUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : `Holdings: ${userUnits}`}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                className="w-full rounded-xl bg-[#04060A] border border-white/15 focus:border-emerald-400 px-3.5 py-2 font-mono text-sm text-white focus:outline-none"
              />
              <span className="absolute left-3 font-mono text-xs text-slate-400">
                USD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className="py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-[#04060A]/90 border border-white/5 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fa" ? "حجم کل پوزیشن:" : "Position Size:"}</span>
              <span className="text-white font-semibold">
                {estimatedUnits} {selectedSymbol.split("/")[0]} (${buyingPowerUSD.toLocaleString("en-US")})
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fa" ? "قیمت اجرا:" : "Exec Price:"}</span>
              <span className="text-cyan-400">
                ${effectivePrice.toLocaleString("en-US")}
              </span>
            </div>
            {liquidationPrice && (
              <div className="flex justify-between text-slate-400">
                <span>
                  {lang === "fa" ? "قیمت لیکویید شدن:" : "Est. Liquidation:"}
                </span>
                <span className="text-amber-400">${liquidationPrice}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              side === "BUY"
                ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
                : "bg-rose-500 hover:bg-rose-400 text-white"
            }`}
          >
            {lang === "fa"
              ? `اجرای آنی ${side === "BUY" ? "خرید" : "فروش"} (${leverage}x)`
              : `Execute ${side} (${leverage}x) • ${selectedSymbol}`}
          </button>
        </form>

        {feedback && (
          <div
            className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
              feedback.ok
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : "bg-rose-500/15 border-rose-500/40 text-rose-200"
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* رادار چندعاملی هوش مصنوعی کوانتومی */}
      <div className="glass-card rounded-2xl border border-white/10 p-4 space-y-3">
        <div className="relative h-24 w-full rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 via-slate-900 to-cyan-500/20 border border-white/10 flex items-center justify-center">
          <img
            src="/aurapulse/assets/quant-core.webp"
            alt="AI Quant Risk Engine"
            className="w-full h-full object-cover opacity-85"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes("/aurapulse/assets/")) {
                target.src = "/assets/quant-core.webp";
              } else {
                target.style.display = "none";
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04060A] via-[#04060A]/30 to-transparent" />
          <div className="absolute bottom-2 right-3 left-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Cpu className="w-4 h-4 text-cyan-400" />
              {lang === "fa"
                ? "رادار هوش مصنوعی کوانتومی"
                : "Neural Quant Alpha Radar"}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              94.2% CONFIDENCE
            </span>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>
              {lang === "fa" ? "جریان سفارشات نهنگ‌ها:" : "Whale Order Flow:"}
            </span>
            <span className="font-mono text-emerald-400">82% Bullish</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#04060A] overflow-hidden">
            <div className="h-full bg-emerald-400 w-[82%]" />
          </div>

          <div className="flex justify-between text-slate-300 pt-1">
            <span>
              {lang === "fa" ? "شاخص نوسان و ریسک:" : "Volatility Risk:"}
            </span>
            <span className="font-mono text-cyan-400">
              {activeAsset.volatilityRisk} / 100
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#04060A] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${activeAsset.volatilityRisk}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              {lang === "fa"
                ? `سیگنال AI برای ${selectedSymbol}: واگرایی مثبت در عمق دفتر سفارشات دیده می‌شود.`
                : `AI Signal for ${selectedSymbol}: Positive order-book imbalance detected.`}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}