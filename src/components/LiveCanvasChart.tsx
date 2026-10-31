"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useAuraStore,
  AssetSymbol,
  Timeframe,
} from "../store/useAuraStore";
import { TrendingUp, TrendingDown, BarChart3, Zap } from "lucide-react";

const SYMBOLS: AssetSymbol[] = ["BTC/USD", "ETH/USD", "NVDA/AI", "SOL/USD"];
const TIMEFRAMES: Timeframe[] = ["1M", "15M", "1H", "1D"];

export default function LiveCanvasChart() {
  const {
    lang,
    selectedSymbol,
    timeframe,
    assets,
    setSelectedSymbol,
    setTimeframe,
  } = useAuraStore();

  const activeAsset = assets[selectedSymbol];
  const isPositive = activeAsset.change24h >= 0;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const data = activeAsset.history;

    ctx.clearRect(0, 0, width, height);

    const minVal = Math.min(...data) * 0.9992;
    const maxVal = Math.max(...data) * 1.0008;
    const range = Math.max(maxVal - minVal, 0.01);

    const padLeft = 16;
    const padRight = 72;
    const padTop = 24;
    const padBottom = 28;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + (plotHeight / gridSteps) * i;
      const priceLabel = (maxVal - (range / gridSteps) * i).toFixed(2);

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillText(`$${priceLabel}`, width - padRight + 8, y + 4);
    }

    const points = data.map((val, idx) => {
      const x = padLeft + (idx / (data.length - 1)) * plotWidth;
      const y = padTop + ((maxVal - val) / range) * plotHeight;
      return { x, y, val };
    });

    const mainColor = isPositive ? "#10B981" : "#F43F5E";
    const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    grad.addColorStop(
      0,
      isPositive ? "rgba(16, 185, 129, 0.32)" : "rgba(244, 63, 94, 0.32)"
    );
    grad.addColorStop(1, "rgba(11, 15, 23, 0.0)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padBottom);
    points.forEach((pt, index) => {
      if (index === 0) {
        ctx.lineTo(pt.x, pt.y);
      } else {
        const prev = points[index - 1];
        const cx = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, height - padBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((pt, index) => {
      if (index === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        const prev = points[index - 1];
        const cx = (prev.x + pt.x) / 2;
        ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
      }
    });
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    const lastPt = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = mainColor;
    ctx.fill();

    if (hoverIndex !== null && points[hoverIndex]) {
      const hPt = points[hoverIndex];
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
      ctx.beginPath();
      ctx.moveTo(hPt.x, padTop);
      ctx.lineTo(hPt.x, height - padBottom);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hPt.x, hPt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00F0FF";
      ctx.fill();
      ctx.restore();
    }
  }, [activeAsset, isPositive, hoverIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - 16;
    const plotWidth = rect.width - 88;
    const ratio = Math.max(0, Math.min(1, relX / plotWidth));
    const idx = Math.round(ratio * (activeAsset.history.length - 1));
    setHoverIndex(idx);
  };

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="rounded-2xl bg-panel/90 border border-white/10 p-4 md:p-6 flex flex-col justify-between space-y-4 shadow-2xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {SYMBOLS.map((sym) => {
            const item = assets[sym];
            const active = sym === selectedSymbol;
            const up = item.change24h >= 0;
            return (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-3.5 py-2 rounded-xl font-mono text-xs transition-all border flex items-center gap-2 ${
                  active
                    ? "bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-400"
                }`}
              >
                <span className="font-bold">{sym}</span>
                <span className={up ? "text-emerald-400" : "text-rose-400"}>
                  {up ? "+" : ""}
                  {item.change24h}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-carbon p-1 rounded-xl border border-white/10 font-mono text-xs">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === tf
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>{activeAsset.name[lang]}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
              Vol: {activeAsset.volume24h}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-2xl md:text-4xl font-mono font-bold text-white tracking-tight">
              $
              {hoverIndex !== null
                ? activeAsset.history[hoverIndex].toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                : activeAsset.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
            </h2>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                isPositive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositive ? "+" : ""}
              {activeAsset.change24h}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-carbon/80 px-3 py-1.5 rounded-xl border border-white/5">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>HTML5 Canvas 60FPS Engine</span>
        </div>
      </div>

      <div
        dir="ltr"
        className="relative w-full h-[270px] sm:h-[330px] rounded-xl bg-carbon/90 border border-white/5 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
}