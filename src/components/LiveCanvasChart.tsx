"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Layers,
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 380 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 20 && rect.height > 20) {
        setCanvasSize((prev) => {
          if (
            Math.abs(prev.width - rect.width) < 2 &&
            Math.abs(prev.height - rect.height) < 2
          ) {
            return prev;
          }
          return { width: Math.floor(rect.width), height: Math.floor(rect.height) };
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allTfCandles = activeAsset.candlesByTf[timeframe] || activeAsset.candlesByTf["15M"];
  const visibleCandles = allTfCandles.slice(-zoomCount);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleCandles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvasSize.width;
    const height = canvasSize.height;
    const isMobile = width < 520;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const padLeft = isMobile ? 10 : 18;
    const padRight = isMobile ? 62 : 78;
    const padTop = 24;
    const padBottom = 26;
    const volumeHeight = isMobile ? 40 : 50;
    const pricePlotHeight = height - padTop - padBottom - volumeHeight - 8;
    const plotWidth = Math.max(80, width - padLeft - padRight);

    const allHighs = visibleCandles.map((c) => c.high);
    const allLows = visibleCandles.map((c) => c.low);
    const rawMax = Math.max(...allHighs);
    const rawMin = Math.min(...allLows);
    const rawSpan = Math.max(rawMax - rawMin, activeAsset.stepSize * 5);
    const padding = rawSpan * 0.16;

    const maxPrice = rawMax + padding;
    const minPrice = rawMin - padding;
    const priceRange = Math.max(maxPrice - minPrice, 0.0001);
    const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 1);

    const priceToY = (p: number) =>
      padTop + ((maxPrice - p) / priceRange) * pricePlotHeight;

    // ۱. شبکه شطرنجی و قیمت‌ها
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.font = `${isMobile ? "9px" : "10.5px"} 'JetBrains Mono', monospace`;
    ctx.fillStyle = "rgba(148, 163, 184, 0.78)";

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + (pricePlotHeight / gridSteps) * i;
      const pVal = maxPrice - (priceRange / gridSteps) * i;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillText(
        `$${pVal.toFixed(pVal < 500 ? 2 : 0)}`,
        width - padRight + 5,
        y + 3
      );
    }

    const stepX = plotWidth / Math.max(visibleCandles.length - 1, 1);
    const candleWidth = Math.max(
      isMobile ? 4 : 5,
      Math.min(16, (plotWidth / visibleCandles.length) * 0.64)
    );

    // ۲. رسم کانال باندهای بولینگر (Bollinger Bands)
    if (showBollinger && visibleCandles.length > 3) {
      const upperPts: { x: number; y: number }[] = [];
      const lowerPts: { x: number; y: number }[] = [];

      visibleCandles.forEach((c, idx) => {
        const slice = visibleCandles.slice(Math.max(0, idx - 5), idx + 1);
        const mean = slice.reduce((s, item) => s + item.close, 0) / slice.length;
        const variance =
          slice.reduce((s, item) => s + Math.pow(item.close - mean, 2), 0) /
          slice.length;
        const std = Math.max(Math.sqrt(variance), rawSpan * 0.08);

        const x = padLeft + idx * stepX;
        upperPts.push({ x, y: priceToY(mean + std * 1.65) });
        lowerPts.push({ x, y: priceToY(mean - std * 1.65) });
      });

      ctx.save();
      ctx.beginPath();
      upperPts.forEach((pt, i) =>
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
      );
      for (let i = lowerPts.length - 1; i >= 0; i--) {
        ctx.lineTo(lowerPts[i].x, lowerPts[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 240, 255, 0.055)";
      ctx.fill();

      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      upperPts.forEach((pt, i) =>
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
      );
      ctx.stroke();

      ctx.beginPath();
      lowerPts.forEach((pt, i) =>
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)
      );
      ctx.stroke();
      ctx.restore();
    }

    // ۳. رسم هیستوگرام حجم معاملات در پایین
    const volTopY = padTop + pricePlotHeight + 8;
    visibleCandles.forEach((c, idx) => {
      const x = padLeft + idx * stepX;
      const isUp = c.close >= c.open;
      const vH = (c.volume / maxVol) * (volumeHeight - 6);
      const vY = volTopY + volumeHeight - vH;

      ctx.fillStyle = isUp
        ? "rgba(16, 185, 129, 0.32)"
        : "rgba(244, 63, 94, 0.32)";
      ctx.fillRect(x - candleWidth / 2, vY, candleWidth, vH);

      const labelStep = isMobile ? 7 : 5;
      if (idx % labelStep === 0) {
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.fillText(c.time, Math.max(padLeft, x - 14), height - 7);
      }
    });

    // ۴. رسم کندل‌استیک‌های نئونی یا منحنی Area
    if (chartMode === "CANDLE") {
      visibleCandles.forEach((c, idx) => {
        const x = padLeft + idx * stepX;
        const isUp = c.close >= c.open;
        const color = isUp ? "#10B981" : "#F43F5E";

        const highY = priceToY(c.high);
        const lowY = priceToY(c.low);
        const openY = priceToY(c.open);
        const closeY = priceToY(c.close);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 2.5);

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = idx === visibleCandles.length - 1 ? 10 : 4;
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.restore();

        // رسم سیگنال‌های هوش مصنوعی روی کندل‌ها
        if (showAISignals && c.signal) {
          ctx.save();
          ctx.font = "bold 9px 'JetBrains Mono', monospace";
          if (c.signal === "BUY") {
            ctx.fillStyle = "#00F0FF";
            ctx.fillText("▲BUY", x - 12, lowY + 11);
          } else {
            ctx.fillStyle = "#F59E0B";
            ctx.fillText("▼SELL", x - 14, highY - 5);
          }
          ctx.restore();
        }
      });
    } else {
      const pts = visibleCandles.map((c, idx) => ({
        x: padLeft + idx * stepX,
        y: priceToY(c.close),
      }));

      const mainColor = isPositive ? "#10B981" : "#F43F5E";
      const grad = ctx.createLinearGradient(0, padTop, 0, padTop + pricePlotHeight);
      grad.addColorStop(
        0,
        isPositive ? "rgba(16, 185, 129, 0.42)" : "rgba(244, 63, 94, 0.42)"
      );
      grad.addColorStop(1, "rgba(4, 6, 10, 0.0)");

      ctx.beginPath();
      ctx.moveTo(pts[0].x, padTop + pricePlotHeight);
      pts.forEach((pt, i) => {
        if (i === 0) ctx.lineTo(pt.x, pt.y);
        else {
          const prev = pts[i - 1];
          const cx = (prev.x + pt.x) / 2;
          ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
        }
      });
      ctx.lineTo(pts[pts.length - 1].x, padTop + pricePlotHeight);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.save();
      ctx.shadowColor = mainColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else {
          const prev = pts[i - 1];
          const cx = (prev.x + pt.x) / 2;
          ctx.bezierCurveTo(cx, prev.y, cx, pt.y, pt.x, pt.y);
        }
      });
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.restore();
    }

    // ۵. رسم خطوط EMA-9 (فیروزه‌ای) و EMA-21 (بنفش)
    if (showEMA) {
      let ema9 = visibleCandles[0].close;
      let ema21 = visibleCandles[0].close;
      const k9 = 2 / 10;
      const k21 = 2 / 22;

      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        ema9 = c.close * k9 + ema9 * (1 - k9);
        const x = padLeft + idx * stepX;
        const y = priceToY(ema9);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        ema21 = c.close * k21 + ema21 * (1 - k21);
        const x = padLeft + idx * stepX;
        const y = priceToY(ema21);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#A855F7";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // ۶. خط قیمت لحظه‌ای و بج سمت راست
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const lastY = priceToY(lastCandle.close);
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = isPositive
      ? "rgba(16, 185, 129, 0.7)"
      : "rgba(244, 63, 94, 0.7)";
    ctx.beginPath();
    ctx.moveTo(padLeft, lastY);
    ctx.lineTo(width - padRight, lastY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isPositive ? "#10B981" : "#F43F5E";
    ctx.fillRect(width - padRight + 2, lastY - 9, padRight - 4, 18);
    ctx.fillStyle = "#030509";
    ctx.font = `bold ${isMobile ? "9px" : "10px"} 'JetBrains Mono', monospace`;
    ctx.fillText(
      `$${lastCandle.close.toFixed(lastCandle.close < 500 ? 2 : 0)}`,
      width - padRight + 5,
      lastY + 3.5
    );

    // ۷. نشانگر لمس موبایل و ماوس + باکس شناور اطلاعات کندل روی نمودار
    if (hoverIdx !== null && visibleCandles[hoverIdx]) {
      const hc = visibleCandles[hoverIdx];
      const hx = padLeft + hoverIdx * stepX;
      const hy = priceToY(hc.close);

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.65)";
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, height - padBottom);
      ctx.moveTo(padLeft, hy);
      ctx.lineTo(width - padRight, hy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00F0FF";
      ctx.fill();
      ctx.restore();
    }
  }, [
    visibleCandles,
    chartMode,
    showBollinger,
    showEMA,
    showAISignals,
    isPositive,
    hoverIdx,
    canvasSize,
    activeAsset.stepSize,
  ]);

  const updatePointerIndex = (clientX: number, rect: DOMRect) => {
    const isMobile = rect.width < 520;
    const padLeft = isMobile ? 10 : 18;
    const padRight = isMobile ? 62 : 78;
    const plotWidth = Math.max(80, rect.width - padLeft - padRight);
    const relX = clientX - rect.left - padLeft;
    const ratio = Math.max(0, Math.min(1, relX / plotWidth));
    const idx = Math.round(ratio * (visibleCandles.length - 1));
    setHoverIdx(idx);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePointerIndex(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerIndex(
        e.touches[0].clientX,
        e.currentTarget.getBoundingClientRect()
      );
    }
  };

  const inspectedCandle =
    hoverIdx !== null && visibleCandles[hoverIdx]
      ? visibleCandles[hoverIdx]
      : visibleCandles[visibleCandles.length - 1];

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="glass-card rounded-2xl border border-white/15 p-3.5 md:p-5 flex flex-col justify-between space-y-3 h-full"
    >
      {/* ردیف اول: انتخاب ارزها و تایم‌فریم‌های واقعی */}
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
                className={`px-2.5 py-1.5 rounded-xl font-mono text-xs transition-all border flex items-center gap-1.5 shrink-0 ${
                  active
                    ? "bg-emerald-500/20 border-emerald-400 text-white neon-border-emerald"
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

        {/* تایم‌فریم‌ها */}
        <div className="flex items-center gap-1 bg-[#030509] p-1 rounded-xl border border-white/10 font-mono text-xs">
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

      {/* ردیف دوم: قیمت لحظه‌ای + دکمه‌های اندیکاتورها (Bollinger / EMA / AI Signals / Zoom) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 font-medium">
            {activeAsset.name[lang]} •{" "}
            <span className="font-mono text-cyan-400">TF: {timeframe}</span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <h2 className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
              $
              {inspectedCandle
                ? inspectedCandle.close.toLocaleString("en-US", {
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

        {/* نوار کنترل اندیکاتورهای مهندسی */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() =>
              setChartMode(chartMode === "CANDLE" ? "AREA" : "CANDLE")
            }
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-300"
          >
            {chartMode === "CANDLE" ? (
              <>
                <CandlestickChart className="w-3.5 h-3.5" />
                <span>Candles</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Area</span>
              </>
            )}
          </button>

          <button
            onClick={toggleBollinger}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              showBollinger
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            BBands
          </button>

          <button
            onClick={toggleEMA}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              showEMA
                ? "bg-purple-500/20 border-purple-400/40 text-purple-300"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            EMA 9/21
          </button>

          <button
            onClick={toggleAISignals}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all ${
              showAISignals
                ? "bg-amber-500/20 border-amber-400/40 text-amber-300"
                : "bg-white/5 border-white/10 text-slate-500"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Signals</span>
          </button>

          <div className="flex items-center gap-0.5 bg-[#030509] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setZoomCount(zoomCount - 6)}
              className="p-1 rounded hover:bg-white/10 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomCount(zoomCount + 6)}
              className="p-1 rounded hover:bg-white/10 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomCount(28)}
              className="p-1 rounded hover:bg-white/10 text-emerald-400"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* نوار OHLC کندل زیر انگشت یا ماوس */}
      {inspectedCandle && (
        <div
          dir="ltr"
          className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono bg-[#030509]/90 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span>
              <b className="text-slate-500">TIME:</b>{" "}
              <span className="text-white">{inspectedCandle.time}</span>
            </span>
            <span>
              <b className="text-slate-500">O:</b> ${inspectedCandle.open}
            </span>
            <span>
              <b className="text-slate-500">H:</b>{" "}
              <span className="text-emerald-400">${inspectedCandle.high}</span>
            </span>
            <span>
              <b className="text-slate-500">L:</b>{" "}
              <span className="text-rose-400">${inspectedCandle.low}</span>
            </span>
            <span>
              <b className="text-slate-500">C:</b>{" "}
              <span className="text-cyan-400 font-bold">
                ${inspectedCandle.close}
              </span>
            </span>
          </div>
          <span className="text-slate-400">Vol: {inspectedCandle.volume}K</span>
        </div>
      )}

      {/* بوم گرافیکی نمودار با پشتیبانی کامل از لمس اندروید */}
      <div
        ref={containerRef}
        dir="ltr"
        className="relative w-full h-[310px] sm:h-[380px] rounded-xl bg-[#030509] border border-white/10 overflow-hidden touch-pan-y"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setHoverIdx(null)}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
}