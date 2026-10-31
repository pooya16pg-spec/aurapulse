"use client";

import React from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import {
  Layers,
  History,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";

export default function PortfolioPositions() {
  const {
    lang,
    assets,
    holdings,
    avgEntryPrices,
    orders,
    selectedSymbol,
    setSelectedSymbol,
    closePosition,
  } = useAuraStore();

  const symbols = Object.keys(holdings) as AssetSymbol[];
  const totalHoldingsUSD = symbols.reduce(
    (acc, sym) => acc + holdings[sym] * assets[sym].price,
    0
  );

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="grid grid-cols-1 lg:grid-cols-12 gap-5"
    >
      {/* جدول پوزیشن‌های باز + دکمه تسویه آنی و برداشت سود */}
      <div className="lg:col-span-8 glass-card rounded-2xl border border-white/15 p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "پوزیشن‌های باز و مدیریت سود/زیان لحظه‌ای (Live Positions)"
                : "Active Institutional Positions & Take-Profit"}
            </h3>
          </div>
          <span className="font-mono text-xs text-emerald-400 font-bold">
            Active Value: $
            {totalHoldingsUSD.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            dir={lang === "fa" ? "rtl" : "ltr"}
          >
            <thead>
              <tr className="text-slate-400 border-b border-white/10 font-mono">
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "دارایی" : "Asset"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "موجودی" : "Size"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "ورود" : "Entry"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "قیمت بازار" : "Mark"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "سود / زیان" : "PnL"}
                </th>
                <th className="pb-2 font-medium text-end">
                  {lang === "fa" ? "عملیات" : "Action"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {symbols.map((sym) => {
                const qty = holdings[sym];
                const info = assets[sym];
                const entry = avgEntryPrices[sym];
                const pnlUSD = qty * (info.price - entry);
                const pnlPct =
                  entry > 0 && qty > 0
                    ? ((info.price - entry) / entry) * 100
                    : 0;

                return (
                  <tr
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`cursor-pointer transition-colors ${
                      selectedSymbol === sym
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="py-3 font-bold text-white">{sym}</td>
                    <td className="py-3 text-slate-200">{qty}</td>
                    <td className="py-3 text-slate-400">
                      ${entry.toLocaleString("en-US")}
                    </td>
                    <td className="py-3 text-cyan-400 font-semibold">
                      ${info.price.toLocaleString("en-US")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          pnlUSD >= 0
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {pnlUSD >= 0 ? "+" : ""}$
                        {pnlUSD.toLocaleString("en-US", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{" "}
                        ({pnlPct >= 0 ? "+" : ""}
                        {pnlPct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-3 text-end">
                      {qty > 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closePosition(sym);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 transition-all text-[11px] font-sans font-bold"
                        >
                          {lang === "fa" ? "تسویه آنی" : "Close / TP"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          {lang === "fa" ? "تسویه‌شده" : "Settled"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* لاگ تراکنش‌ها */}
      <div className="lg:col-span-4 glass-card rounded-2xl border border-white/15 p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "لاگ زنده معاملات (Order Tape)"
                : "Live Execution Tape"}
            </h3>
          </div>
          <span className="font-mono text-[11px] text-emerald-400">
            0.3ms Fill
          </span>
        </div>

        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-2.5 rounded-xl bg-[#030509]/90 border border-white/10 flex items-center justify-between font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`p-1.5 rounded-lg ${
                    ord.side === "BUY"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {ord.side === "BUY" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                </span>
                <div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <span>
                      {ord.side} {ord.amount} {ord.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                      {ord.leverage}x
                    </span>
                    {ord.tag && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                        {ord.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {ord.id} • {ord.timestamp}
                  </div>
                </div>
              </div>

              <div className="text-end">
                <div className="text-slate-200">
                  @${ord.executionPrice.toLocaleString("en-US")}
                </div>
                <div className="text-[10px] text-emerald-400">FILLED</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}