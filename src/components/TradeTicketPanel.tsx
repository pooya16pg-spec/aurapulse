"use client";

import React, { useState } from "react";
import { useAuraStore } from "../store/useAuraStore";
import SmartAssetImage from "./SmartAssetImage";
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
      className="space-y-4 flex flex-col justify-between h-full min-w-0"
    >
      <div className="cyber-card rounded-2xl border border-white/15 p-4 space-y-3.5">
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
              className="btn-cyber text-[10px] font-mono px-2 py-0.5 rounded text-cyan-300"
            >
              Limit: ${selectedOrderBookPrice} ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#020408] border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === "BUY" ? "btn-cyber-active" : "btn-cyber"
            }`}
          >
            {lang === "fa" ? "خرید تعهدی (LONG)" : "LONG / BUY"}
          </button>
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === "SELL" ? "btn-cyber-danger" : "btn-cyber"
            }`}
          >
            {lang === "fa" ? "فروش تعهدی (SHORT)" : "SHORT / SELL"}
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              {lang === "fa" ? "اهرم معاملاتی (Leverage):" : "Margin Leverage:"}
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {leverage}x
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
            {LEVERAGES.map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => setLeverage(lev)}
                className={`py-1.5 rounded-lg transition-all ${
                  leverage === lev ? "btn-cyber-active" : "btn-cyber"
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
                {lang === "fa"
                  ? "مارجین ورودی (USD):"
                  : "Collateral Margin (USD):"}
              </span>
              <span className="font-mono text-slate-300">
                {side === "BUY"
                  ? `Avail: $${balanceUSD.toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}`
                  : `Holdings: ${userUnits}`}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                className="w-full rounded-xl bg-[#020408] border border-cyan-500/30 focus:border-emerald-400 px-3.5 py-2 font-mono text-sm text-white focus:outline-none"
              />
              <span className="absolute left-3 font-mono text-xs text-cyan-400">
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
                className="btn-cyber py-1.5 rounded-lg font-bold"
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-[#020408]/90 border border-white/10 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fa" ? "حجم کل پوزیشن:" : "Position Size:"}</span>
              <span className="text-white font-semibold">
                {estimatedUnits} {selectedSymbol.split("/")[0]} ($
                {buyingPowerUSD.toLocaleString("en-US")})
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
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              side === "BUY" ? "btn-cyber-active" : "btn-cyber-danger"
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

      {/* رادار هوش مصنوعی با ادغام هولوگرافیک عکس دوم در بافت تاریک سایت */}
      <div className="cyber-card rounded-2xl border border-white/15 p-4 space-y-3 relative overflow-hidden">
        <div
          className="hologram-banner"
          style={{ height: "145px", maxHeight: "145px" }}
        >
          <SmartAssetImage
            baseName="quant-core"
            alt="AI Quant Risk Engine"
            className="hologram-img-blend"
            style={{
              width: "100%",
              height: "145px",
              objectFit: "cover",
              objectPosition: "center",
            }}
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-[#040711]/60 pointer-events-none" />
          <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between z-10">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white drop-shadow">
              <Cpu className="w-4 h-4 text-cyan-400" />
              {lang === "fa"
                ? "رادار هوش مصنوعی کوانتومی"
                : "Neural Quant Alpha Radar"}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 font-bold">
              94.8% CONFIDENCE
            </span>
          </div>
        </div>

        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>
              {lang === "fa" ? "جریان سفارشات نهنگ‌ها:" : "Whale Order Flow:"}
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {activeAsset.whaleScore}% Bullish
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#020408] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${activeAsset.whaleScore}%` }}
            />
          </div>

          <div className="flex justify-between text-slate-300 pt-1">
            <span>
              {lang === "fa" ? "شاخص نوسان و ریسک:" : "Volatility Risk:"}
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {activeAsset.volatilityRisk} / 100
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#020408] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-500"
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