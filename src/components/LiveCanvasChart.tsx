"use client";

import React, { useState } from "react";
import {
  useAuraStore,
  AssetSymbol,
  Timeframe,
} from "../store/useAuraStore";
import {
  TrendingUp,
  TrendingDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  CandlestickChart,
  Sparkles,
} from "lucide-react";

const SYMBOLS: AssetSymbol[] = ["BTC/USD", "ETH/USD", "NVDA/AI", "SOL/USD"];
const TIMEFRAMES: Timeframe[] = ["1M", "15M", "1H", "1D"];

export default function LiveCanvasChart() {
  const {
    lang,
    selectedSymbol,
    timeframe,
    chartMode,
    showBollinger,
    showEMA,
    showAISignals,
    zoomCount,
    assets,
    setSelectedSymbol,
    setTimeframe,
    setChartMode,
    toggleBollinger,
    toggleEMA,
    toggleAISignals,
    setZoomCount,
  } = useAuraStore();

  const activeAsset = assets[selectedSymbol];
  const isPositive = activeAsset.change24h >= 0;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const allTfCandles =
    activeAsset.candlesByTf[timeframe] || activeAsset.candlesByTf["15M"];
  const visibleCandles = allTfCandles.slice(-zoomCount);

  const W = 800;
  const H = 360;
  const padT = 18;
  const priceH = 240;
  const volTop = padT + priceH + 14;
  const volH = 72;

  const highs = visibleCandles.map((c) => c.high);
  const lows = visibleCandles.map((c) => c.low);
  const rawMax = Math.max(...highs);
  const rawMin = Math.min(...lows);
  const rawSpan = Math.max(rawMax - rawMin, activeAsset.stepSize * 4);
  const maxP = rawMax + rawSpan * 0.14;
  const minP = rawMin - rawSpan * 0.14;
  const rangeP = Math.max(maxP - minP, 0.0001);
  const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 1);

  const priceToY = (p: number) => padT + ((maxP - p) / rangeP) * priceH;
  const stepX = W / Math.max(visibleCandles.length, 1);
  const candleW = Math.max(6, Math.min(18, stepX * 0.6));

  let ema9 = visibleCandles[0]?.close || activeAsset.price;
  let ema21 = visibleCandles[0]?.close || activeAsset.price;
  const k9 = 2 / 10;
  const k21 = 2 / 22;

  const ema9Points: string[] = [];
  const ema21Points: string[] = [];
  const bbUpper: { x: number; y: number }[] = [];
  const bbLower: { x: number; y: number }[] = [];
  const closePoints: { x: number; y: number }[] = [];

  visibleCandles.forEach((c, idx) => {
    const x = Number((idx * stepX + stepX / 2).toFixed(1));
    const yClose = Number(priceToY(c.close).toFixed(1));
    closePoints.push({ x, y: yClose });

    ema9 = c.close * k9 + ema9 * (1 - k9);
    ema21 = c.close * k21 + ema21 * (1 - k21);
    ema9Points.push(`${x},${priceToY(ema9).toFixed(1)}`);
    ema21Points.push(`${x},${priceToY(ema21).toFixed(1)}`);

    const slice = visibleCandles.slice(Math.max(0, idx - 5), idx + 1);
    const mean = slice.reduce((s, item) => s + item.close, 0) / slice.length;
    const variance =
      slice.reduce((s, item) => s + Math.pow(item.close - mean, 2), 0) /
      slice.length;
    const std = Math.max(Math.sqrt(variance), rawSpan * 0.08);
    bbUpper.push({ x, y: Number(priceToY(mean + std * 1.65).toFixed(1)) });
    bbLower.push({ x, y: Number(priceToY(mean - std * 1.65).toFixed(1)) });
  });

  const bbPolygonPoints = [
    ...bbUpper.map((p) => `${p.x},${p.y}`),
    ...[...bbLower].reverse().map((p) => `${p.x},${p.y}`),
  ].join(" ");

  const areaLinePoints = closePoints.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPolygonPoints =
    closePoints.length > 0
      ? `${closePoints[0].x},${padT + priceH} ${areaLinePoints} ${
          closePoints[closePoints.length - 1].x
        },${padT + priceH}`
      : "";

  const rsiPoints = visibleCandles
    .map((c, idx) => {
      const x = (idx * stepX + stepX / 2).toFixed(1);
      const y = (volTop + ((100 - c.rsi) / 100) * volH).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");

  const lastCandle = visibleCandles[visibleCandles.length - 1];
  const lastY = lastCandle ? priceToY(lastCandle.close) : padT + priceH / 2;
  const lastRatioPct = Math.max(5, Math.min(92, (lastY / H) * 100));

  const inspected =
    hoverIdx !== null && visibleCandles[hoverIdx]
      ? visibleCandles[hoverIdx]
      : lastCandle;

  const priceLabels = [0, 0.25, 0.5, 0.75, 1].map(
    (r) => maxP - rangeP * r
  );

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="cyber-card rounded-2xl border border-white/15 p-3.5 md:p-5 flex flex-col justify-between space-y-3 h-full min-w-0 overflow-hidden"
    >
      {/* ردیف اول: نمادها و تایم‌فریم‌ها */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {SYMBOLS.map((sym) => {
            const item = assets[sym];
            const active = sym === selectedSymbol;
            const up = item.change24h >= 0;
            return (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all border flex items-center gap-1.5 shrink-0 ${
                  active
                    ? "bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "bg-white/[0.03] hover:bg-white/10 border-white/10 text-slate-400"
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

        <div className="flex items-center gap-1 bg-[#020408] p-1 rounded-xl border border-white/10 font-mono text-xs">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg transition-all font-bold ${
                timeframe === tf
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ردیف دوم: قیمت و ابزارهای اندیکاتور */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-bold text-slate-200">
              {activeAsset.name[lang]}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              CRISP VECTOR HD
            </span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-1">
            <h2 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight">
              $
              {inspected
                ? inspected.close.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                : activeAsset.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
            </h2>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                isPositive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? "+" : ""}
              {activeAsset.change24h}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() =>
              setChartMode(chartMode === "CANDLE" ? "AREA" : "CANDLE")
            }
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-bold"
          >
            {chartMode === "CANDLE" ? (
              <>
                <CandlestickChart className="w-3.5 h-3.5" />
                <span>Candles</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Neon Area</span>
              </>
            )}
          </button>

          <button
            onClick={toggleBollinger}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              showBollinger
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 font-bold"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            BBands
          </button>

          <button
            onClick={toggleEMA}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              showEMA
                ? "bg-purple-500/20 border-purple-400/50 text-purple-200 font-bold"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            EMA 9/21
          </button>

          <button
            onClick={toggleAISignals}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
              showAISignals
                ? "bg-amber-500/20 border-amber-400/50 text-amber-200 font-bold"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Signals</span>
          </button>

          <div className="flex items-center gap-0.5 bg-[#020408] p-0.5 rounded-lg border border-white/15">
            <button
              onClick={() => setZoomCount(zoomCount - 5)}
              className="p-1.5 rounded hover:bg-white/10 text-cyan-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomCount(zoomCount + 5)}
              className="p-1.5 rounded hover:bg-white/10 text-cyan-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomCount(26)}
              className="p-1.5 rounded hover:bg-white/10 text-emerald-400"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* نوار تلمتری کندل انتخابی */}
      {inspected && (
        <div
          dir="ltr"
          className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono bg-[#020408]/95 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>
              <b className="text-slate-500">TIME:</b>{" "}
              <span className="text-white">{inspected.time}</span>
            </span>
            <span>
              <b className="text-slate-500">O:</b> ${inspected.open}
            </span>
            <span>
              <b className="text-slate-500">H:</b>{" "}
              <span className="text-emerald-400">${inspected.high}</span>
            </span>
            <span>
              <b className="text-slate-500">L:</b>{" "}
              <span className="text-rose-400">${inspected.low}</span>
            </span>
            <span>
              <b className="text-slate-500">C:</b>{" "}
              <span className="text-cyan-300 font-bold">${inspected.close}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-purple-300">RSI: {inspected.rsi}</span>
            <span className="text-slate-400">Vol: {inspected.volume}K</span>
          </div>
        </div>
      )}

      {/* بوم ترکیبی: گرافیک برداری SVG + ستون قیمت و زمان HTML بدون کشیدگی */}
      <div
        dir="ltr"
        className="relative w-full rounded-xl bg-[#020409] border border-white/15 overflow-hidden select-none"
      >
        <div className="flex items-stretch h-[300px] sm:h-[365px]">
          {/* بخش ترسیم برداری */}
          <div className="relative flex-1 min-w-0">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-full block"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="areaGradDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.12" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padT + priceH * ratio;
                return (
                  <line
                    key={`grid-${i}`}
                    x1={0}
                    y1={y}
                    x2={W}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                );
              })}

              {showBollinger && bbUpper.length > 2 && (
                <g>
                  <polygon points={bbPolygonPoints} fill="url(#bbGrad)" />
                  <polyline
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.4)"
                    strokeWidth="1.4"
                    points={bbUpper.map((p) => `${p.x},${p.y}`).join(" ")}
                  />
                  <polyline
                    fill="none"
                    stroke="rgba(0, 240, 255, 0.4)"
                    strokeWidth="1.4"
                    points={bbLower.map((p) => `${p.x},${p.y}`).join(" ")}
                  />
                </g>
              )}

              {chartMode === "CANDLE" ? (
                visibleCandles.map((c, idx) => {
                  const cx = idx * stepX + stepX / 2;
                  const isUp = c.close >= c.open;
                  const color = isUp ? "#10B981" : "#F43F5E";
                  const highY = priceToY(c.high);
                  const lowY = priceToY(c.low);
                  const openY = priceToY(c.open);
                  const closeY = priceToY(c.close);
                  const bodyTop = Math.min(openY, closeY);
                  const bodyH = Math.max(Math.abs(closeY - openY), 3);

                  return (
                    <g key={`candle-${idx}`}>
                      <line
                        x1={cx}
                        y1={highY}
                        x2={cx}
                        y2={lowY}
                        stroke={color}
                        strokeWidth="1.8"
                      />
                      <rect
                        x={cx - candleW / 2}
                        y={bodyTop}
                        width={candleW}
                        height={bodyH}
                        rx="1.5"
                        fill={color}
                      />
                    </g>
                  );
                })
              ) : (
                <g>
                  <polygon
                    points={areaPolygonPoints}
                    fill={
                      isPositive ? "url(#areaGradUp)" : "url(#areaGradDown)"
                    }
                  />
                  <polyline
                    fill="none"
                    stroke={isPositive ? "#10B981" : "#F43F5E"}
                    strokeWidth="2.8"
                    points={areaLinePoints}
                  />
                </g>
              )}

              {showEMA && (
                <g>
                  <polyline
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="2"
                    points={ema9Points.join(" ")}
                  />
                  <polyline
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="1.8"
                    strokeDasharray="4 3"
                    points={ema21Points.join(" ")}
                  />
                </g>
              )}

              {lastCandle && (
                <line
                  x1={0}
                  y1={lastY}
                  x2={W}
                  y2={lastY}
                  stroke={isPositive ? "#10B981" : "#F43F5E"}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              )}

              <line
                x1={0}
                y1={volTop - 6}
                x2={W}
                y2={volTop - 6}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />

              {visibleCandles.map((c, idx) => {
                const cx = idx * stepX + stepX / 2;
                const isUp = c.close >= c.open;
                const barH = (c.volume / maxVol) * (volH - 8);
                const barY = volTop + volH - barH;
                return (
                  <rect
                    key={`vol-${idx}`}
                    x={cx - candleW / 2}
                    y={barY}
                    width={candleW}
                    height={barH}
                    rx="1"
                    fill={
                      isUp
                        ? "rgba(16, 185, 129, 0.35)"
                        : "rgba(244, 63, 94, 0.35)"
                    }
                  />
                );
              })}

              <polyline
                fill="none"
                stroke="#C084FC"
                strokeWidth="1.8"
                points={rsiPoints}
              />

              {hoverIdx !== null && visibleCandles[hoverIdx] && (
                <line
                  x1={hoverIdx * stepX + stepX / 2}
                  y1={0}
                  x2={hoverIdx * stepX + stepX / 2}
                  y2={H}
                  stroke="#00F0FF"
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                />
              )}

              {visibleCandles.map((_, idx) => (
                <rect
                  key={`hit-${idx}`}
                  x={idx * stepX}
                  y={0}
                  width={stepX}
                  height={H}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIdx(idx)}
                  onTouchStart={() => setHoverIdx(idx)}
                />
              ))}
            </svg>

            {/* تگ‌های سیگنال AI با فونت کاملاً صاف HTML بدون کشیدگی */}
            {showAISignals &&
              visibleCandles.map((c, idx) => {
                if (!c.signal) return null;
                const leftPct = ((idx + 0.5) / visibleCandles.length) * 100;
                const yPos =
                  c.signal === "BUY" ? priceToY(c.low) : priceToY(c.high);
                const topPct = Math.max(
                  6,
                  Math.min(62, (yPos / H) * 100 + (c.signal === "BUY" ? 3 : -6))
                );
                return (
                  <div
                    key={`sig-${idx}`}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    className={`pointer-events-none absolute -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border shadow-md ${
                      c.signal === "BUY"
                        ? "bg-cyan-500/25 border-cyan-400 text-cyan-200"
                        : "bg-amber-500/25 border-amber-400 text-amber-200"
                    }`}
                  >
                    {c.signal === "BUY" ? "▲BUY" : "▼SELL"}
                  </div>
                );
              })}

            <div className="pointer-events-none absolute left-2.5 bottom-14 text-[9px] font-mono text-purple-300/90 bg-[#020409]/80 px-1.5 py-0.5 rounded">
              VOLUME & RSI(14)
            </div>
          </div>

          {/* ستون سمت راست قیمت‌ها (HTML خالص برای وضوح ۱۰۰٪ روی موبایل و دسکتاپ) */}
          <div className="relative w-16 sm:w-20 border-l border-white/10 bg-[#03060E] flex flex-col justify-between py-3 px-1.5 font-mono text-[10px] text-slate-400">
            {priceLabels.map((val, i) => (
              <div key={i} className="text-right truncate">
                ${val.toFixed(val < 500 ? 2 : 0)}
              </div>
            ))}
            <div className="text-[9px] text-purple-400 text-right border-t border-white/10 pt-1">
              RSI 14
            </div>

            {lastCandle && (
              <div
                style={{ top: `${lastRatioPct}%` }}
                className={`absolute left-0.5 right-0.5 -translate-y-1/2 py-0.5 px-1 rounded text-[10px] font-bold text-center shadow-lg ${
                  isPositive
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-rose-500 text-white"
                }`}
              >
                ${lastCandle.close.toFixed(lastCandle.close < 500 ? 2 : 0)}
              </div>
            )}
          </div>
        </div>

        {/* نوار افقی زمان در پایین نمودار */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/10 bg-[#03060E] font-mono text-[10px] text-slate-400 pr-20">
          {visibleCandles
            .filter(
              (_, idx) =>
                idx % Math.max(1, Math.floor(visibleCandles.length / 5)) === 0
            )
            .map((c, i) => (
              <span key={i}>{c.time}</span>
            ))}
        </div>
      </div>
    </div>
  );
}