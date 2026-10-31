"use client";

import React, { useState } from "react";
import { useAuraStore } from "../store/useAuraStore";
import {
  ArrowDownUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function TradeTicketPanel() {
  const {
    lang,
    selectedSymbol,
    assets,
    balanceUSD,
    holdings,
    executeOrder,
  } = useAuraStore();

  const activeAsset = assets[selectedSymbol];
  const userUnits = holdings[selectedSymbol];

  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [usdInput, setUsdInput] = useState<string>("2500");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);

  const numericUSD = parseFloat(usdInput) || 0;
  const estimatedUnits = (numericUSD / activeAsset.price).toFixed(4);

  const handlePercentage = (pct: number) => {
    if (side === "BUY") {
      setUsdInput(Math.floor((balanceUSD * pct) / 100).toString());
    } else {
      const maxSellUSD = userUnits * activeAsset.price;
      setUsdInput(Math.floor((maxSellUSD * pct) / 100).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = executeOrder(side, numericUSD);
    if (success) {
      setFeedback({
        ok: true,
        msg:
          lang === "fa"
            ? `سفارش آزمایشی ${side === "BUY" ? "خرید" : "فروش"} با موفقیت در حساب محلی ثبت شد.`
            : `Simulated ${side} paper order for ${selectedSymbol} in the local demo account.`,
      });
    } else {
      setFeedback({
        ok: false,
        msg:
          lang === "fa"
            ? "موجودی کافی برای انجام این تراکنش وجود ندارد."
            : "Insufficient balance or asset holdings for this order.",
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="space-y-4 flex flex-col justify-between"
    >
      <div className="rounded-2xl bg-panel/90 border border-white/10 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === "fa"
                ? "ثبت سفارش آزمایشی محلی"
                : "Local Paper-Trade Ticket"}
            </span>
          </h3>
          <span className="font-mono text-[11px] text-cyan-400">
            {selectedSymbol}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-carbon border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`py-2 rounded-lg font-bold transition-all ${
              side === "BUY"
                ? "bg-emerald-500 text-slate-950 shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {lang === "fa" ? "خرید (LONG / BUY)" : "BUY / LONG"}
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
            {lang === "fa" ? "فروش (SELL)" : "SELL"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>
                {lang === "fa" ? "مبلغ سفارش آزمایشی (USD):" : "Paper Order Value (USD):"}
              </span>
              <span className="font-mono text-slate-300">
                {side === "BUY"
                  ? `Max: $${balanceUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : `Holdings: ${userUnits} ${selectedSymbol.split("/")[0]}`}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={usdInput}
                onChange={(e) => setUsdInput(e.target.value)}
                className="w-full rounded-xl bg-carbon border border-white/15 focus:border-emerald-400 px-3.5 py-2.5 font-mono text-sm text-white focus:outline-none"
              />
              <span className="absolute left-3 font-mono text-xs text-slate-400">
                USD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentage(pct)}
                className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-carbon/80 border border-white/5 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fa" ? "مقدار دریافتی:" : "Est. Size:"}</span>
              <span className="text-white">
                {estimatedUnits} {selectedSymbol.split("/")[0]}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fa" ? "قیمت اجرا:" : "Fill Price:"}</span>
              <span className="text-cyan-400">
                ${activeAsset.price.toLocaleString("en-US")}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fa" ? "کارمزد شبیه‌سازی:" : "Fee Model:"}</span>
              <span className="text-emerald-400">Not applied</span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              side === "BUY"
                ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
                : "bg-rose-500 hover:bg-rose-400 text-white"
            }`}
          >
            {lang === "fa"
              ? `شبیه‌سازی سفارش ${side === "BUY" ? "خرید" : "فروش"} ${selectedSymbol}`
              : `Simulate ${side} • ${selectedSymbol}`}
          </button>
        </form>

        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
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

      <div className="rounded-2xl bg-panel/90 border border-white/10 p-4 space-y-3 shadow-2xl">
        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 via-slate-900 to-cyan-500/20 border border-white/10 flex items-center justify-center">
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
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />
          <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Cpu className="w-4 h-4 text-cyan-400" />
              {lang === "fa"
                ? "موتور تحلیل ریسک کوانتومی"
                : "Neural Quant Risk Engine"}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              DEMO METRICS
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>
              {lang === "fa" ? "شاخص نوسان و ریسک:" : "Volatility Risk Score:"}
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {activeAsset.volatilityRisk} / 100
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-carbon overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${activeAsset.volatilityRisk}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              {lang === "fa"
                ? `شاخص‌های نمایشی ${selectedSymbol} از داده‌های نمونه ساخته شده‌اند و تحلیل جریان نهادی یا لغزش واقعی بازار نیستند.`
                : `Illustrative demo metrics for ${selectedSymbol}; not institutional order flow or a live slippage estimate.`}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}