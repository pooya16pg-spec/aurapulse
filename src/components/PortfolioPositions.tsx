"use client";

import React from "react";
import { useAuraStore, AssetSymbol } from "../store/useAuraStore";
import { Layers, History, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function PortfolioPositions() {
  const {
    lang,
    assets,
    holdings,
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
      className="grid grid-cols-1 lg:grid-cols-12 gap-4"
    >
      <div className="lg:col-span-7 rounded-2xl bg-panel/90 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "پرتفوی آزمایشی و تخصیص سرمایه"
                : "Demo Paper Portfolio"}
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Assets Value: $
            {totalHoldingsUSD.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-xs text-right"
            dir={lang === "fa" ? "rtl" : "ltr"}
          >
            <thead>
              <tr className="text-slate-400 border-b border-white/5 font-mono">
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "دارایی" : "Asset"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "موجودی" : "Balance"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "قیمت لحظه‌ای" : "Live Price"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "ارزش دلاری" : "Value (USD)"}
                </th>
                <th className="pb-2 font-medium text-start">
                  {lang === "fa" ? "سهم پرتفوی" : "Weight"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {symbols.map((sym) => {
                const qty = holdings[sym];
                const info = assets[sym];
                const valUSD = qty * info.price;
                const weight =
                  totalHoldingsUSD > 0 ? (valUSD / totalHoldingsUSD) * 100 : 0;

                return (
                  <tr
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`cursor-pointer transition-colors ${
                      selectedSymbol === sym
                        ? "bg-white/5"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <td className="py-3 font-bold text-white">{sym}</td>
                    <td className="py-3 text-slate-300">{qty}</td>
                    <td className="py-3 text-cyan-400">
                      ${info.price.toLocaleString("en-US")}
                    </td>
                    <td className="py-3 text-emerald-400 font-semibold">
                      $
                      {valUSD.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-carbon overflow-hidden">
                          <div
                            className="h-full bg-cyan-400"
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

      <div className="lg:col-span-5 rounded-2xl bg-panel/90 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === "fa"
                ? "سوابق سفارش‌های آزمایشی محلی"
                : "Local Paper Order Log"}
            </h3>
          </div>
          <span className="font-mono text-[10px] text-amber-300">
            LOCAL DEMO
          </span>
        </div>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="p-3 rounded-xl bg-carbon/80 border border-white/5 flex items-center justify-between font-mono text-xs"
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
                  <div className="text-white font-bold">
                    {ord.side} {ord.amount} {ord.symbol}
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
                <div className="text-[10px] text-cyan-400">FILLED</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}