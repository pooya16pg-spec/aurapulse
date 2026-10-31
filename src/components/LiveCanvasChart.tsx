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
  BarChart2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
  CandlestickChart,
} from "lucide-react";

const SYMBOLS: AssetSymbol[] = ["BTC/USD", "ETH/USD", "NVDA/AI", "SOL/USD"];
const TIMEFRAMES: Timeframe[] = ["1M", "15M", "1H", "1D"];

export default function LiveCanvasChart() {
  const {
    lang,
    selectedSymbol,
    timeframe,
    chartMode,
    zoomCount,
    assets,
    setSelectedSymbol,
    setTimeframe,
    setChartMode,
    setZoomCount,
  } = useAuraStore();

  const activeAsset = assets[selectedSymbol];
  const isPositive = activeAsset.change24h >= 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 390 });

  // رصد تغییر سایز صفحه و زوم مرورگر برای جلوگیری از کشیدگی یا گم شدن نمودار
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    window.addEventListener("resize", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  const visibleCandles = activeAsset.candles.slice(-zoomCount);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleCandles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvasSize.width;
    const height = canvasSize.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 18;
    const padRight = 82;
    const padTop = 22;
    const padBottom = 30;
    const volumeHeight = 52;
    const pricePlotHeight = height - padTop - padBottom - volumeHeight - 10;
    const plotWidth = Math.max(100, width - padLeft - padRight);

    // محاسبه دقیق سقف و کف واقعی کندل‌های قابل مشاهده (حل ۱۰۰٪ مشکل گم شدن نمودار)
    const allHighs = visibleCandles.map((c) => c.high);
    const allLows = visibleCandles.map((c) => c.low);
    const rawMax = Math.max(...allHighs);
    const rawMin = Math.min(...allLows);
    const rawSpan = Math.max(rawMax - rawMin, activeAsset.stepSize * 6);
    const padding = rawSpan * 0.14;

    const maxPrice = rawMax + padding;
    const minPrice = rawMin - padding;
    const priceRange = Math.max(maxPrice - minPrice, 0.0001);

    const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 1);

    const priceToY = (p: number) =>
      padTop + ((maxPrice - p) / priceRange) * pricePlotHeight;

    // ۱. رسم شبکه افقی و برچسب‌های قیمت
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(148, 163, 184, 0.75)";

    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + (pricePlotHeight / gridSteps) * i;
      const pVal = maxPrice - (priceRange / gridSteps) * i;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillText(
        `$${pVal.toLocaleString("en-US", {
          minimumFractionDigits: pVal < 500 ? 2 : 1,
          maximumFractionDigits: pVal < 500 ? 2 : 1,
        })}`,
        width - padRight + 8,
        y + 4
      );
    }

    // خط جداکننده ناحیه حجم معاملات
    const volTopY = padTop + pricePlotHeight + 10;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(padLeft, volTopY);
    ctx.lineTo(width - padRight, volTopY);
    ctx.stroke();

    const stepX = plotWidth / Math.max(visibleCandles.length - 1, 1);
    const candleWidth = Math.max(4, Math.min(18, (plotWidth / visibleCandles.length) * 0.62));

    // ۲. رسم هیستوگرام حجم معاملات در پایین نمودار (Volume Bars)
    visibleCandles.forEach((c, idx) => {
      const x = padLeft + idx * stepX;
      const isUp = c.close >= c.open;
      const vH = (c.volume / maxVol) * (volumeHeight - 6);
      const vY = volTopY + volumeHeight - vH;

      ctx.fillStyle = isUp
        ? "rgba(16, 185, 129, 0.28)"
        : "rgba(244, 63, 94, 0.28)";
      ctx.fillRect(x - candleWidth / 2, vY, candleWidth, vH);

      // برچسب زمان در محور افقی
      if (idx % Math.ceil(visibleCandles.length / 5) === 0) {
        ctx.fillStyle = "rgba(148, 163, 184, 0.55)";
        ctx.fillText(c.time, x - 20, height - 8);
      }
    });

    // ۳. رسم نمودار اصلی (حالت کندل‌استیک یا حالت منحنی نئونی)
    if (chartMode === "CANDLE") {
      visibleCandles.forEach((c, idx) => {
        const x = padLeft + idx * stepX;
        const isUp = c.close >= c.open;
        const color = isUp ? "#10B981" : "#F43F5E";

        const highY = priceToY(c.high);
        const lowY = priceToY(c.low);
        const openY = priceToY(c.open);
        const closeY = priceToY(c.close);

        // فتیله کندل (Wick)
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // بدنه کندل (Body)
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 2.5);
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
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
        isPositive ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)"
      );
      grad.addColorStop(1, "rgba(8, 11, 18, 0.0)");

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
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }

    // ۴. رسم خط میانگین متحرک نمایی (EMA-9 الگوریتمی به رنگ فیروزه‌ای)
    ctx.beginPath();
    let ema = visibleCandles[0].close;
    const k = 2 / (9 + 1);
    visibleCandles.forEach((c, idx) => {
      ema = c.close * k + ema * (1 - k);
      const x = padLeft + idx * stepX;
      const y = priceToY(ema);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // ۵. خط افقی آخرین قیمت بازار + بج قیمت زنده
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const lastY = priceToY(lastCandle.close);
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = isPositive
      ? "rgba(16, 185, 129, 0.65)"
      : "rgba(244, 63, 94, 0.65)";
    ctx.beginPath();
    ctx.moveTo(padLeft, lastY);
    ctx.lineTo(width - padRight, lastY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isPositive ? "#10B981" : "#F43F5E";
    ctx.fillRect(width - padRight + 2, lastY - 9, padRight - 4, 18);
    ctx.fillStyle = "#04060A";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillText(
      `$${lastCandle.close.toFixed(2)}`,
      width - padRight + 6,
      lastY + 3.5
    );

    // ۶. نشانگر ماوس (Crosshair)
    if (hoverIdx !== null && visibleCandles[hoverIdx]) {
      const hc = visibleCandles[hoverIdx];
      const hx = padLeft + hoverIdx * stepX;
      const hy = priceToY(hc.close);

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.55)";
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, height - padBottom);
      ctx.moveTo(padLeft, hy);
      ctx.lineTo(width - padRight, hy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00F0FF";
      ctx.fill();
      ctx.restore();
    }
  }, [visibleCandles, chartMode, isPositive, hoverIdx, canvasSize, activeAsset.stepSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const padLeft = 18;
    const padRight = 82;
    const plotWidth = Math.max(100, rect.width - padLeft - padRight);
    const relX = e.clientX - rect.left - padLeft;
    const ratio = Math.max(0, Math.min(1, relX / plotWidth));
    const idx = Math.round(ratio * (visibleCandles.length - 1));
    setHoverIdx(idx);
  };

  const inspectedCandle =
    hoverIdx !== null && visibleCandles[hoverIdx]
      ? visibleCandles[hoverIdx]
      : visibleCandles[visibleCandles.length - 1];

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="glass-card rounded-2xl border border-white/10 p-4 md:p-5 flex flex-col justify-between space-y-3.5 h-full"
    >
      {/* ردیف بالا: انتخاب نماد، حالت نمودار، تایم‌فریم و کنترل زوم */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {SYMBOLS.map((sym) => {
            const item = assets[sym];
            const active = sym === selectedSymbol;
            const up = item.change24h >= 0;
            return (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all border flex items-center gap-2 ${
                  active
                    ? "bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "bg-white/[0.03] hover:bg-white/10 border-white/5 text-slate-400"
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

        <div className="flex flex-wrap items-center gap-2">
          {/* سوییچ کندل‌استیک و منحنی */}
          <div className="flex items-center gap-1 bg-[#04060A] p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setChartMode("CANDLE")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                chartMode === "CANDLE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartMode("AREA")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                chartMode === "AREA"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
          </div>

          {/* کنترل زوم واقعی روی کندل‌ها */}
          <div className="flex items-center gap-1 bg-[#04060A] p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              title="Zoom In"
              onClick={() => setZoomCount(zoomCount - 6)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-cyan-300 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              title="Zoom Out"
              onClick={() => setZoomCount(zoomCount + 6)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-cyan-300 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              title="Reset Zoom"
              onClick={() => setZoomCount(32)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-emerald-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* تایم‌فریم */}
          <div className="flex items-center gap-1 bg-[#04060A] p-1 rounded-xl border border-white/10 font-mono text-xs">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded-lg transition-all ${
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
      </div>

      {/* ردیف اطلاعات OHLC و آمار ۲۴ ساعته */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">{activeAsset.name[lang]}</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
              EMA-9 Overlay
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">
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

        {/* نوار تلمتری کندل فعال (OHLCV) */}
        {inspectedCandle && (
          <div
            dir="ltr"
            className="flex flex-wrap items-center gap-3 text-[11px] font-mono bg-[#04060A]/90 px-3.5 py-2 rounded-xl border border-white/10"
          >
            <div>
              <span className="text-slate-500">O: </span>
              <span className="text-slate-200">${inspectedCandle.open}</span>
            </div>
            <div>
              <span className="text-slate-500">H: </span>
              <span className="text-emerald-400">${inspectedCandle.high}</span>
            </div>
            <div>
              <span className="text-slate-500">L: </span>
              <span className="text-rose-400">${inspectedCandle.low}</span>
            </div>
            <div>
              <span className="text-slate-500">C: </span>
              <span className="text-cyan-400 font-bold">${inspectedCandle.close}</span>
            </div>
            <div>
              <span className="text-slate-500">Vol: </span>
              <span className="text-slate-200">{inspectedCandle.volume}K</span>
            </div>
          </div>
        )}
      </div>

      {/* بوم گرافیکی نمودار */}
      <div
        ref={containerRef}
        dir="ltr"
        className="relative w-full h-[340px] sm:h-[390px] rounded-xl bg-[#04060A] border border-white/10 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
          className="w-full h-full cursor-crosshair block"
        />
      </div>
    </div>
  );
}