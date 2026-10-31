"use client";

import React from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import { Layers, History, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function PortfolioPositions() {
  const {
    lang,
    assets,
    holdings,
    avgEntryPrices,
    orders,
    selectedSymbol,
    setSelectedSymbol,
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
      {/* جدول پوزیشن‌های باز و سود و زیان لحظه‌ای */}
      <div className="lg:col-span-8 glass-card rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "پوزیشن‌های باز، میانگین ورود و سود/زیان لحظه‌ای (Live PnL)"
                : "Active Institutional Positions & Live PnL"}
            </h3>
          </div>
          <span className="font-mono text-xs text-emerald-400">
            Total Value: $
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
              <tr className="text-slate-400 border-b border-white/5 font-mono">
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "دارایی" : "Instrument"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "موجودی" : "Size"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "میانگین ورود" : "Avg Entry"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "قیمت بازار" : "Mark Price"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "سود / زیان (PnL)" : "Unrealized PnL"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "سهم پرتفوی" : "Allocation"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {symbols.map((sym) => {
                const qty = holdings[sym];
                const info = assets[sym];
                const entry = avgEntryPrices[sym];
                const valUSD = qty * info.price;
                const pnlUSD = qty * (info.price - entry);
                const pnlPct = entry > 0 ? ((info.price - entry) / entry) * 100 : 0;
                const weight =
                  totalHoldingsUSD > 0 ? (valUSD / totalHoldingsUSD) * 100 : 0;

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
                    <td className="py-3 text-slate-300">{qty}</td>
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
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ({pnlPct >= 0 ? "+" : ""}
                        {pnlPct.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#04060A] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                            style={{ width: `${weight}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {weight.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* لاگ تراکنش‌های ثبت‌شده */}
      <div className="lg:col-span-4 glass-card rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "لاگ اجرای سفارشات (Order Tape)"
                : "Institutional Execution Tape"}
            </h3>
          </div>
          <span className="font-mono text-[11px] text-emerald-400">
            0.4ms Fill
          </span>
        </div>

        <div className="space-y-2.5 max-h-[225px] overflow-y-auto pr-1">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-3 rounded-xl bg-[#04060A]/90 border border-white/5 flex items-center justify-between font-mono text-xs"
            >
              <div className="flex items-center gap-2.5">
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