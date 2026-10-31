"use client";

import { useState, useEffect } from "react";

export type Lang = "fa" | "en";
export type AssetSymbol = "BTC/USD" | "ETH/USD" | "NVDA/AI" | "SOL/USD";
export type Timeframe = "1M" | "15M" | "1H" | "1D";
export type ChartMode = "CANDLE" | "AREA";
export type ThemePreset = "EMERALD" | "PURPLE" | "GOLD";
export type ActiveWorkspace = "TERMINAL" | "HEATMAP" | "AILAB" | "ARCHITECT";

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  signal?: "BUY" | "SELL";
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  depthPercent: number;
}

export interface AssetInfo {
  symbol: AssetSymbol;
  name: { fa: string; en: string };
  sector: { fa: string; en: string };
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  marketCap: string;
  volatilityRisk: number;
  whaleScore: number;
  stepSize: number;
  history: number[];
  candles: CandlePoint[];
  candlesByTf: Record<Timeframe, CandlePoint[]>;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}

export interface BinanceMarketUpdate {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
}

export interface TradeOrder {
  id: string;
  symbol: AssetSymbol;
  side: "BUY" | "SELL";
  amount: number;
  leverage: number;
  executionPrice: number;
  timestamp: string;
  tag?: string;
  feeUSD?: number;
  realizedPnlUSD?: number;
}

interface AuraState {
  lang: Lang;
  theme: ThemePreset;
  workspace: ActiveWorkspace;
  selectedSymbol: AssetSymbol;
  timeframe: Timeframe;
  chartMode: ChartMode;
  showBollinger: boolean;
  showEMA: boolean;
  showAISignals: boolean;
  zoomCount: number;
  selectedOrderBookPrice: number | null;
  isCommandOpen: boolean;
  isLiveStreamActive: boolean;
  isBinanceConnected: boolean;
  isAutoBotActive: boolean;
  lastNotification: string | null;
  aiLogs: string[];
  balanceUSD: number;
  realizedPnlUSD: number;
  isAccountHydrated: boolean;
  assets: Record<AssetSymbol, AssetInfo>;
  holdings: Record<AssetSymbol, number>;
  avgEntryPrices: Record<AssetSymbol, number>;
  orders: TradeOrder[];
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildTimeframeCandles(
  basePrice: number,
  stepSize: number,
  seedOffset: number,
  tfLabel: Timeframe
): CandlePoint[] {
  const list: CandlePoint[] = [];
  const count = 40;
  const mult =
    tfLabel === "1M" ? 1.0 : tfLabel === "15M" ? 1.8 : tfLabel === "1H" ? 3.0 : 5.0;
  const unitStep = stepSize * mult;
  let current = basePrice - unitStep * 4;

  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(seedOffset + i * 17.3);
    const r2 = seededRandom(seedOffset + i * 31.7);
    const r3 = seededRandom(seedOffset + i * 47.9);

    const wave = Math.sin(i * 0.45 + seedOffset) * unitStep * 2.2;
    const delta = (r1 - 0.48) * unitStep * 3.2 + wave * 0.45;

    const open = Number(current.toFixed(2));
    let close = Number((open + delta).toFixed(2));
    if (Math.abs(close - open) < unitStep * 0.35) {
      close = Number((open + (r1 >= 0.5 ? 1 : -1) * unitStep * 0.65).toFixed(2));
    }

    const body = Math.abs(close - open);
    const high = Number((Math.max(open, close) + body * (0.35 + r2 * 0.85)).toFixed(2));
    const low = Number((Math.min(open, close) - body * (0.35 + r3 * 0.85)).toFixed(2));
    const volume = Number((35 + r2 * 95).toFixed(1));
    const rsi = Math.round(32 + Math.sin(i * 0.5 + seedOffset) * 24 + r1 * 18);

    let signal: "BUY" | "SELL" | undefined = undefined;
    if (i === 8 || i === 19 || i === 29 || i === 36) {
      signal = close >= open ? "BUY" : "SELL";
    }

    const mins = (i * (tfLabel === "1M" ? 1 : tfLabel === "15M" ? 15 : 30)) % 60;
    const hrs = (9 + Math.floor(i / 4)) % 24;
    const timeStr = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    list.push({ time: timeStr, open, high, low, close, volume, rsi, signal });
    current = close;
  }
  return list;
}

function buildOrderBook(midPrice: number, step: number, seed: number) {
  const asks: OrderBookLevel[] = [];
  const bids: OrderBookLevel[] = [];
  let askTotal = 0;
  let bidTotal = 0;

  for (let i = 1; i <= 7; i++) {
    const rAsk = seededRandom(seed + i * 7.1);
    const rBid = seededRandom(seed + i * 11.3);

    const askPrice = Number((midPrice + i * step * (0.8 + rAsk * 0.4)).toFixed(2));
    const askSize = Number((0.5 + rAsk * 3.8).toFixed(3));
    askTotal = Number((askTotal + askSize).toFixed(3));
    asks.push({ price: askPrice, size: askSize, total: askTotal, depthPercent: 0 });

    const bidPrice = Number((midPrice - i * step * (0.8 + rBid * 0.4)).toFixed(2));
    const bidSize = Number((0.5 + rBid * 3.8).toFixed(3));
    bidTotal = Number((bidTotal + bidSize).toFixed(3));
    bids.push({ price: bidPrice, size: bidSize, total: bidTotal, depthPercent: 0 });
  }

  const maxTotal = Math.max(askTotal, bidTotal, 1);
  asks.forEach((a) => (a.depthPercent = Math.min(100, Math.round((a.total / maxTotal) * 100))));
  bids.forEach((b) => (b.depthPercent = Math.min(100, Math.round((b.total / maxTotal) * 100))));

  return { asks: asks.reverse(), bids };
}

function makeAsset(
  symbol: AssetSymbol,
  name: { fa: string; en: string },
  sector: { fa: string; en: string },
  basePrice: number,
  change24h: number,
  volume24h: string,
  marketCap: string,
  volatilityRisk: number,
  whaleScore: number,
  stepSize: number,
  seed: number
): AssetInfo {
  const candlesByTf: Record<Timeframe, CandlePoint[]> = {
    "1M": buildTimeframeCandles(basePrice, stepSize, seed + 10, "1M"),
    "15M": buildTimeframeCandles(basePrice, stepSize, seed + 20, "15M"),
    "1H": buildTimeframeCandles(basePrice, stepSize, seed + 30, "1H"),
    "1D": buildTimeframeCandles(basePrice, stepSize, seed + 40, "1D"),
  };

  const activeCandles = candlesByTf["15M"];
  const lastClose = activeCandles[activeCandles.length - 1].close;
  const { asks, bids } = buildOrderBook(lastClose, stepSize, seed);
  const highs = activeCandles.map((c) => c.high);
  const lows = activeCandles.map((c) => c.low);

  return {
    symbol,
    name,
    sector,
    price: lastClose,
    change24h,
    high24h: Number(Math.max(...highs).toFixed(2)),
    low24h: Number(Math.min(...lows).toFixed(2)),
    volume24h,
    marketCap,
    volatilityRisk,
    whaleScore,
    stepSize,
    history: activeCandles.map((c) => c.close),
    candles: activeCandles,
    candlesByTf,
    asks,
    bids,
  };
}

const INITIAL_ASSETS: Record<AssetSymbol, AssetInfo> = {
  "BTC/USD": makeAsset(
    "BTC/USD",
    { fa: "بیت‌کوین / تتر (پرپچوال کوانتومی)", en: "Bitcoin Quantum Perpetual" },
    { fa: "لایه اول • طلای دیجیتال", en: "Layer-1 • Store of Value" },
    94280.5,
    4.82,
    "$42.8B",
    "$1.86T",
    34,
    88,
    45.0,
    101
  ),
  "ETH/USD": makeAsset(
    "ETH/USD",
    { fa: "اتریوم / تتر (قرارداد هوشمند)", en: "Ethereum Institutional Perp" },
    { fa: "زیرساخت دیفای و Web3", en: "Smart Contracts & DeFi" },
    3420.75,
    2.94,
    "$19.4B",
    "$412B",
    42,
    79,
    4.5,
    202
  ),
  "NVDA/AI": makeAsset(
    "NVDA/AI",
    { fa: "سهام انویدیا (شاخص هوش مصنوعی)", en: "NVIDIA AI Synthetic Index" },
    { fa: "پردازنده‌های کوانتومی و AI", en: "AI Compute & GPUs" },
    148.6,
    6.15,
    "$31.2B",
    "$3.62T",
    28,
    94,
    0.45,
    303
  ),
  "SOL/USD": makeAsset(
    "SOL/USD",
    { fa: "سولانا / تتر (فرکانس بالا)", en: "Solana High-Frequency Perp" },
    { fa: "بلاکچین فوق سریع ۶۵,۰۰۰ TPS", en: "High-Throughput L1" },
    218.4,
    -1.35,
    "$9.7B",
    "$104B",
    58,
    71,
    0.65,
    404
  ),
};

const PAPER_ACCOUNT_STORAGE_KEY = "aurapulse:paper-account:v1";
const PAPER_FEE_RATE = 0.001; // 0.10% illustrative simulator fee, not an exchange fee quote.
let tickCounter = 0;
let hasHydratedPaperAccount = false;

let globalState: AuraState = {
  lang: "fa",
  theme: "EMERALD",
  workspace: "TERMINAL",
  selectedSymbol: "BTC/USD",
  timeframe: "15M",
  chartMode: "CANDLE",
  showBollinger: true,
  showEMA: true,
  showAISignals: true,
  zoomCount: 26,
  selectedOrderBookPrice: null,
  isCommandOpen: false,
  isLiveStreamActive: true,
  isBinanceConnected: false,
  isAutoBotActive: false,
  lastNotification: null,
  aiLogs: [
    "[DEMO] Market simulator initialized; seeded chart history is illustrative.",
    "[DEMO] BTC / ETH / SOL use public Binance 24h ticker data when reachable.",
    "[DEMO] NVDA/AI is a synthetic demo symbol, not a live exchange listing.",
    "[PAPER] Orders are local browser calculations; no exchange orders are sent.",
  ],
  balanceUSD: 128500.0,
  realizedPnlUSD: 0,
  isAccountHydrated: false,
  assets: INITIAL_ASSETS,
  holdings: {
    "BTC/USD": 0.85,
    "ETH/USD": 8.5,
    "NVDA/AI": 120,
    "SOL/USD": 45,
  },
  avgEntryPrices: {
    "BTC/USD": 91450.0,
    "ETH/USD": 3290.0,
    "NVDA/AI": 141.2,
    "SOL/USD": 212.5,
  },
  orders: [
    {
      id: "ORD-9041",
      symbol: "BTC/USD",
      side: "BUY",
      amount: 0.25,
      leverage: 5,
      executionPrice: 93420.0,
      timestamp: "14:22:10",
      tag: "MANUAL",
    },
    {
      id: "ORD-9040",
      symbol: "NVDA/AI",
      side: "BUY",
      amount: 50,
      leverage: 2,
      executionPrice: 145.8,
      timestamp: "13:50:44",
      tag: "AI-SIGNAL",
    },
  ],
};

const listeners = new Set<() => void>();

function setState(updater: (prev: AuraState) => Partial<AuraState>) {
  globalState = { ...globalState, ...updater(globalState) };
  listeners.forEach((listener) => listener());
}

function persistPaperAccount(state: AuraState = globalState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PAPER_ACCOUNT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        balanceUSD: state.balanceUSD,
        realizedPnlUSD: state.realizedPnlUSD,
        holdings: state.holdings,
        avgEntryPrices: state.avgEntryPrices,
        orders: state.orders.slice(0, 100),
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Private browsing or disabled storage should not interrupt paper trading.
  }
}

const hydratePaperAccount = () => {
  if (hasHydratedPaperAccount || typeof window === "undefined") return;
  hasHydratedPaperAccount = true;
  try {
    const raw = window.localStorage.getItem(PAPER_ACCOUNT_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as {
        version?: number;
        balanceUSD?: number;
        realizedPnlUSD?: number;
        holdings?: Partial<Record<AssetSymbol, number>>;
        avgEntryPrices?: Partial<Record<AssetSymbol, number>>;
        orders?: TradeOrder[];
      };
      if (
        saved.version === 1 &&
        typeof saved.balanceUSD === "number" &&
        Number.isFinite(saved.balanceUSD) &&
        saved.balanceUSD >= 0
      ) {
        const symbols: AssetSymbol[] = ["BTC/USD", "ETH/USD", "NVDA/AI", "SOL/USD"];
        const holdings = { ...globalState.holdings };
        const avgEntryPrices = { ...globalState.avgEntryPrices };
        symbols.forEach((symbol) => {
          const quantity = saved.holdings?.[symbol];
          const entry = saved.avgEntryPrices?.[symbol];
          if (typeof quantity === "number" && Number.isFinite(quantity) && quantity >= 0) {
            holdings[symbol] = quantity;
          }
          if (typeof entry === "number" && Number.isFinite(entry) && entry >= 0) {
            avgEntryPrices[symbol] = entry;
          }
        });
        const orders = Array.isArray(saved.orders)
          ? saved.orders.filter(
              (order) =>
                order &&
                typeof order.id === "string" &&
                symbols.includes(order.symbol) &&
                (order.side === "BUY" || order.side === "SELL") &&
                Number.isFinite(order.amount) &&
                Number.isFinite(order.executionPrice)
            ).slice(0, 100)
          : globalState.orders;
        setState(() => ({
          balanceUSD: saved.balanceUSD as number,
          realizedPnlUSD:
            typeof saved.realizedPnlUSD === "number" && Number.isFinite(saved.realizedPnlUSD)
              ? saved.realizedPnlUSD
              : 0,
          holdings,
          avgEntryPrices,
          orders,
          isAccountHydrated: true,
        }));
        return;
      }
    }
  } catch {
    // Ignore malformed or unavailable local account data and keep the seeded demo account.
  }
  setState(() => ({ isAccountHydrated: true }));
};

const resetPaperAccount = () => {
  setState(() => ({
    balanceUSD: 128500,
    realizedPnlUSD: 0,
    holdings: {
      "BTC/USD": 0.85,
      "ETH/USD": 8.5,
      "NVDA/AI": 120,
      "SOL/USD": 45,
    },
    avgEntryPrices: {
      "BTC/USD": 91450,
      "ETH/USD": 3290,
      "NVDA/AI": 141.2,
      "SOL/USD": 212.5,
    },
    orders: [
      {
        id: "ORD-9041",
        symbol: "BTC/USD",
        side: "BUY",
        amount: 0.25,
        leverage: 5,
        executionPrice: 93420,
        timestamp: "14:22:10",
        tag: "SEEDED-DEMO",
      },
      {
        id: "ORD-9040",
        symbol: "NVDA/AI",
        side: "BUY",
        amount: 50,
        leverage: 2,
        executionPrice: 145.8,
        timestamp: "13:50:44",
        tag: "SEEDED-DEMO",
      },
    ],
    isAutoBotActive: false,
    lastNotification:
      globalState.lang === "fa"
        ? "حساب آزمایشی به مقادیر اولیه بازنشانی شد."
        : "Paper account reset to its starter values.",
  }));
  persistPaperAccount(globalState);
};

const toggleLang = () =>
  setState((state) => ({ lang: state.lang === "fa" ? "en" : "fa" }));

const setTheme = (theme: ThemePreset) => setState(() => ({ theme }));

const setWorkspace = (workspace: ActiveWorkspace) =>
  setState(() => ({ workspace }));

const setSelectedSymbol = (sym: AssetSymbol) =>
  setState(() => ({ selectedSymbol: sym, selectedOrderBookPrice: null }));

const setTimeframe = (tf: Timeframe) => setState(() => ({ timeframe: tf }));

const setChartMode = (mode: ChartMode) => setState(() => ({ chartMode: mode }));

const toggleBollinger = () =>
  setState((state) => ({ showBollinger: !state.showBollinger }));

const toggleEMA = () => setState((state) => ({ showEMA: !state.showEMA }));

const toggleAISignals = () =>
  setState((state) => ({ showAISignals: !state.showAISignals }));

const setZoomCount = (count: number) =>
  setState(() => ({ zoomCount: Math.max(12, Math.min(38, count)) }));

const setSelectedOrderBookPrice = (price: number | null) =>
  setState(() => ({ selectedOrderBookPrice: price }));

const setCommandOpen = (open: boolean) =>
  setState(() => ({ isCommandOpen: open }));

const toggleLiveStream = () =>
  setState((state) => ({ isLiveStreamActive: !state.isLiveStreamActive }));

const setBinanceConnected = (connected: boolean) =>
  setState(() => ({ isBinanceConnected: connected }));

const applyBinanceTickerData = (
  updates: Partial<Record<AssetSymbol, BinanceMarketUpdate>>
) => {
  const nextAssets = { ...globalState.assets };
  const timeframe = globalState.timeframe;
  let applied = 0;

  (["BTC/USD", "ETH/USD", "SOL/USD"] as AssetSymbol[]).forEach((sym) => {
    const quote = updates[sym];
    if (
      !quote ||
      !Number.isFinite(quote.price) ||
      quote.price <= 0 ||
      !Number.isFinite(quote.change24h)
    ) return;

    const item = nextAssets[sym];
    const candles = [...item.candlesByTf[timeframe]];
    if (candles.length > 0) {
      const lastIndex = candles.length - 1;
      const last = candles[lastIndex];
      candles[lastIndex] = {
        ...last,
        close: quote.price,
        high: Math.max(last.high, quote.price),
        low: Math.min(last.low, quote.price),
      };
    }
    const { asks, bids } = buildOrderBook(
      quote.price,
      item.stepSize,
      Date.now() + applied
    );

    nextAssets[sym] = {
      ...item,
      price: quote.price,
      change24h: quote.change24h,
      high24h: quote.high24h,
      low24h: quote.low24h,
      volume24h: quote.volume24h,
      history: candles.map((c) => c.close),
      candles,
      candlesByTf: { ...item.candlesByTf, [timeframe]: candles },
      asks,
      bids,
    };
    applied += 1;
  });

  if (applied > 0) {
    setState(() => ({ assets: nextAssets, isBinanceConnected: true }));
  }
};

const toggleAutoBot = () =>
  setState((state) => {
    const next = !state.isAutoBotActive;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    return {
      isAutoBotActive: next,
      aiLogs: [
        `[${now}] AUTO-BOT :: ${
          next
            ? "Local 1x spot paper-trading simulation ENABLED"
            : "Local paper-trading demo bot PAUSED by user"
        }`,
        ...state.aiLogs.slice(0, 12),
      ],
      lastNotification: next
        ? state.lang === "fa"
          ? "🤖 شبیه‌ساز محلی معاملات آزمایشی فعال شد."
          : "🤖 Local paper-trading demo bot activated."
        : state.lang === "fa"
        ? "ربات آزمایشی معاملات محلی متوقف شد."
        : "Local paper-trading demo bot paused.",
    };
  });

const triggerMarketShock = (direction: "PUMP" | "CRASH") => {
  setState((state) => {
    const sym = state.selectedSymbol;
    const item = state.assets[sym];
    const tf = state.timeframe;
    const candles = [...item.candlesByTf[tf]];
    const last = candles[candles.length - 1];

    const move = (direction === "PUMP" ? 1 : -1) * item.stepSize * 3.2;
    const nextClose = Number(Math.max(item.stepSize * 4, last.close + move).toFixed(2));
    const open = last.close;
    const high = Number((Math.max(open, nextClose) + item.stepSize * 1.1).toFixed(2));
    const low = Number((Math.min(open, nextClose) - item.stepSize * 0.8).toFixed(2));
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const shockCandle: CandlePoint = {
      time: nowStr,
      open,
      high,
      low,
      close: nextClose,
      volume: 142.0,
      rsi: direction === "PUMP" ? 74 : 28,
      signal: direction === "PUMP" ? "BUY" : "SELL",
    };

    const nextCandles = [...candles.slice(1), shockCandle];
    const { asks, bids } = buildOrderBook(nextClose, item.stepSize, Date.now());

    return {
      aiLogs: [
        `[${nowStr}] MARKET-SHOCK :: ${direction} wave detected on ${sym} @ $${nextClose}`,
        ...state.aiLogs.slice(0, 12),
      ],
      lastNotification:
        direction === "PUMP"
          ? state.lang === "fa"
            ? `🚀 موج خرید نهنگ‌ها روی ${sym} تزریق شد ($${nextClose.toLocaleString("en-US")})`
            : `🚀 Whale Bull Wave injected into ${sym} ($${nextClose.toLocaleString("en-US")})`
          : state.lang === "fa"
          ? `⚡ تست استرس ریزش روی ${sym} اعمال شد ($${nextClose.toLocaleString("en-US")})`
          : `⚡ Flash Stress-Test triggered on ${sym} ($${nextClose.toLocaleString("en-US")})`,
      assets: {
        ...state.assets,
        [sym]: {
          ...item,
          price: nextClose,
          change24h: Number(
            (item.change24h + (direction === "PUMP" ? 0.85 : -0.85)).toFixed(2)
          ),
          high24h: Math.max(item.high24h, high),
          low24h: Math.min(item.low24h, low),
          history: nextCandles.map((c) => c.close),
          candles: nextCandles,
          candlesByTf: {
            ...item.candlesByTf,
            [tf]: nextCandles,
          },
          asks,
          bids,
        },
      },
    };
  });
};

const tickMarket = () => {
  if (!globalState.isLiveStreamActive) return;
  tickCounter++;
  setState((state) => {
    const updatedAssets = { ...state.assets };
    const tf = state.timeframe;
    const isNewCandleTick = tickCounter % 3 === 0;
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    (Object.keys(updatedAssets) as AssetSymbol[]).forEach((sym) => {
      const item = updatedAssets[sym];
      if (state.isBinanceConnected && sym !== "NVDA/AI") {
        updatedAssets[sym] = item;
        return;
      }
      const candles = [...item.candlesByTf[tf]];
      const last = { ...candles[candles.length - 1] };

      const recentSlice = candles.slice(-10);
      const recentAvg =
        recentSlice.reduce((s, c) => s + c.close, 0) / recentSlice.length;
      const pull = (recentAvg - last.close) * 0.12;
      const stepDelta = (Math.random() - 0.485) * item.stepSize * 1.45 + pull;
      const nextClose = Number(
        Math.max(item.stepSize * 5, last.close + stepDelta).toFixed(2)
      );

      let nextCandles: CandlePoint[];
      if (isNewCandleTick) {
        const open = last.close;
        const body = Math.abs(nextClose - open);
        const wick = Math.max(body * 0.55, item.stepSize * 0.65);
        const high = Number((Math.max(open, nextClose) + wick).toFixed(2));
        const low = Number((Math.min(open, nextClose) - wick).toFixed(2));
        const volume = Number((38 + Math.random() * 82).toFixed(1));
        const rsi = Math.min(85, Math.max(20, Math.round(last.rsi + (Math.random() - 0.48) * 10)));
        const signal =
          Math.random() > 0.84 ? (nextClose >= open ? "BUY" : "SELL") : undefined;

        nextCandles = [
          ...candles.slice(1),
          { time: nowStr, open, high, low, close: nextClose, volume, rsi, signal },
        ];
      } else {
        last.close = nextClose;
        last.high = Number(Math.max(last.high, nextClose + item.stepSize * 0.25).toFixed(2));
        last.low = Number(Math.min(last.low, nextClose - item.stepSize * 0.25).toFixed(2));
        last.volume = Number((last.volume + Math.random() * 6).toFixed(1));
        candles[candles.length - 1] = last;
        nextCandles = candles;
      }

      const deltaPct = ((nextClose - item.price) / item.price) * 100;
      const { asks, bids } = buildOrderBook(
        nextClose,
        item.stepSize,
        tickCounter + sym.length
      );

      updatedAssets[sym] = {
        ...item,
        price: nextClose,
        change24h: Number((item.change24h + deltaPct * 0.5).toFixed(2)),
        high24h: Math.max(item.high24h, nextClose),
        low24h: Math.min(item.low24h, nextClose),
        history: nextCandles.map((c) => c.close),
        candles: nextCandles,
        candlesByTf: {
          ...item.candlesByTf,
          [tf]: nextCandles,
        },
        asks,
        bids,
      };
    });

    let nextOrders = state.orders;
    let nextHoldings = state.holdings;
    let nextBalance = state.balanceUSD;
    let nextLogs = state.aiLogs;

    if (state.isAutoBotActive && tickCounter % 2 === 0 && state.balanceUSD > 500) {
      const activeSym = state.selectedSymbol;
      const activePrice = updatedAssets[activeSym].price;
      const tradeUSD = 400;
      const units = Number((tradeUSD / activePrice).toFixed(6));
      const feeUSD = Number((tradeUSD * PAPER_FEE_RATE).toFixed(2));
      const previousUnits = state.holdings[activeSym];
      const nextUnits = Number((previousUnits + units).toFixed(6));
      const nextAverage = nextUnits > 0
        ? Number(((previousUnits * state.avgEntryPrices[activeSym] + units * activePrice) / nextUnits).toFixed(4))
        : activePrice;
      const botOrder: TradeOrder = {
        id: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
        symbol: activeSym,
        side: "BUY",
        amount: units,
        leverage: 1,
        executionPrice: activePrice,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        tag: "DEMO-BOT",
        feeUSD,
      };
      nextBalance = Number((state.balanceUSD - tradeUSD - feeUSD).toFixed(2));
      nextHoldings = {
        ...state.holdings,
        [activeSym]: nextUnits,
      };
      nextOrders = [botOrder, ...state.orders.slice(0, 99)];
      nextLogs = [
        `[${nowStr}] DEMO-BOT :: Simulated 1x spot BUY on ${activeSym} (${units} units @ ${activePrice})`,
        ...state.aiLogs.slice(0, 12),
      ];
    }

    return {
      assets: updatedAssets,
      balanceUSD: nextBalance,
      holdings: nextHoldings,
      orders: nextOrders,
      avgEntryPrices: nextOrders === state.orders ? state.avgEntryPrices : {
        ...state.avgEntryPrices,
        [state.selectedSymbol]: Number(((state.holdings[state.selectedSymbol] * state.avgEntryPrices[state.selectedSymbol] + (400 / updatedAssets[state.selectedSymbol].price) * updatedAssets[state.selectedSymbol].price) / (state.holdings[state.selectedSymbol] + (400 / updatedAssets[state.selectedSymbol].price))).toFixed(4)),
      },
      aiLogs: nextLogs,
    };
  });
  if (globalState.isAutoBotActive && tickCounter % 2 === 0 && globalState.balanceUSD > 500) {
    persistPaperAccount(globalState);
  }
};

const executeOrder = (
  side: "BUY" | "SELL",
  usdAmount: number,
  leverage = 1
): boolean => {
  const sym = globalState.selectedSymbol;
  const activeAsset = globalState.assets[sym];
  const execPrice = globalState.selectedOrderBookPrice || activeAsset.price;
  if (
    !Number.isFinite(usdAmount) ||
    usdAmount <= 0 ||
    !Number.isFinite(execPrice) ||
    execPrice <= 0 ||
    !Number.isFinite(leverage) ||
    leverage < 1 ||
    leverage > 5
  ) return false;

  const nowStr = new Date().toLocaleTimeString("en-US", { hour12: false });

  if (side === "BUY") {
    const notionalUSD = usdAmount * leverage;
    const feeUSD = Number((notionalUSD * PAPER_FEE_RATE).toFixed(2));
    const totalDebit = Number((usdAmount + feeUSD).toFixed(2));
    if (globalState.balanceUSD < totalDebit) return false;

    const units = Number((notionalUSD / execPrice).toFixed(6));
    const prevQty = globalState.holdings[sym];
    const prevAvg = globalState.avgEntryPrices[sym];
    const newQty = Number((prevQty + units).toFixed(6));
    const newAvg =
      newQty > 0
        ? Number(((prevQty * prevAvg + units * execPrice) / newQty).toFixed(4))
        : execPrice;

    const newOrder: TradeOrder = {
      id: `ORD-${Date.now()}`,
      symbol: sym,
      side: "BUY",
      amount: units,
      leverage,
      executionPrice: execPrice,
      timestamp: nowStr,
      tag: "MANUAL-PAPER",
      feeUSD,
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD - totalDebit).toFixed(2)),
      holdings: { ...state.holdings, [sym]: newQty },
      avgEntryPrices: { ...state.avgEntryPrices, [sym]: newAvg },
      orders: [newOrder, ...state.orders.slice(0, 99)],
      aiLogs: [
        `[${nowStr}] PAPER-FILL :: BUY ${units} ${sym} @ $${execPrice} • fee $${feeUSD.toFixed(2)}`,
        ...state.aiLogs.slice(0, 12),
      ],
      lastNotification:
        state.lang === "fa"
          ? `سفارش آزمایشی خرید ثبت شد؛ کارمزد شبیه‌سازی‌شده $${feeUSD.toFixed(2)}`
          : `Paper BUY filled; simulated fee $${feeUSD.toFixed(2)}`,
    }));
    persistPaperAccount(globalState);
    return true;
  }

  const currentUnits = globalState.holdings[sym];
  if (currentUnits <= 0) return false;
  const requestedUnits = usdAmount / execPrice;
  const actualSell = Math.min(currentUnits, requestedUnits);
  const grossProceeds = Number((actualSell * execPrice).toFixed(2));
  const feeUSD = Number((grossProceeds * PAPER_FEE_RATE).toFixed(2));
  const netProceeds = Number((grossProceeds - feeUSD).toFixed(2));
  const entryPrice = globalState.avgEntryPrices[sym];
  const realizedPnlUSD = Number(((execPrice - entryPrice) * actualSell - feeUSD).toFixed(2));
  const remainingUnits = Number(Math.max(0, currentUnits - actualSell).toFixed(6));

  const newOrder: TradeOrder = {
    id: `ORD-${Date.now()}`,
    symbol: sym,
    side: "SELL",
    amount: Number(actualSell.toFixed(6)),
    leverage: 1,
    executionPrice: execPrice,
    timestamp: nowStr,
    tag: "MANUAL-PAPER",
    feeUSD,
    realizedPnlUSD,
  };

  setState((state) => ({
    balanceUSD: Number((state.balanceUSD + netProceeds).toFixed(2)),
    holdings: { ...state.holdings, [sym]: remainingUnits },
    avgEntryPrices: {
      ...state.avgEntryPrices,
      [sym]: remainingUnits === 0 ? 0 : state.avgEntryPrices[sym],
    },
    realizedPnlUSD: Number((state.realizedPnlUSD + realizedPnlUSD).toFixed(2)),
    orders: [newOrder, ...state.orders.slice(0, 99)],
    aiLogs: [
      `[${nowStr}] PAPER-FILL :: SELL ${actualSell} ${sym} @ $${execPrice} • net P&L $${realizedPnlUSD.toFixed(2)}`,
      ...state.aiLogs.slice(0, 12),
    ],
    lastNotification:
      state.lang === "fa"
        ? `سفارش آزمایشی فروش ثبت شد؛ سود/زیان تحقق‌یافته $${realizedPnlUSD.toFixed(2)}`
        : `Paper SELL filled; realized P&L $${realizedPnlUSD.toFixed(2)}`,
  }));
  persistPaperAccount(globalState);
  return true;
};

const closePosition = (sym: AssetSymbol) => {
  const qty = globalState.holdings[sym];
  if (qty <= 0) return;
  const price = globalState.assets[sym].price;
  const grossProceeds = Number((qty * price).toFixed(2));
  const feeUSD = Number((grossProceeds * PAPER_FEE_RATE).toFixed(2));
  const netProceeds = Number((grossProceeds - feeUSD).toFixed(2));
  const realizedPnlUSD = Number(((price - globalState.avgEntryPrices[sym]) * qty - feeUSD).toFixed(2));
  const nowStr = new Date().toLocaleTimeString("en-US", { hour12: false });

  const closeOrder: TradeOrder = {
    id: `CLS-${Date.now()}`,
    symbol: sym,
    side: "SELL",
    amount: qty,
    leverage: 1,
    executionPrice: price,
    timestamp: nowStr,
    tag: "CLOSE-PAPER",
    feeUSD,
    realizedPnlUSD,
  };

  setState((state) => ({
    balanceUSD: Number((state.balanceUSD + netProceeds).toFixed(2)),
    holdings: { ...state.holdings, [sym]: 0 },
    avgEntryPrices: { ...state.avgEntryPrices, [sym]: 0 },
    realizedPnlUSD: Number((state.realizedPnlUSD + realizedPnlUSD).toFixed(2)),
    orders: [closeOrder, ...state.orders.slice(0, 99)],
    lastNotification:
      state.lang === "fa"
        ? `پوزیشن ${sym} بسته شد؛ سود/زیان خالص $${realizedPnlUSD.toFixed(2)}`
        : `Closed ${sym}; net realized P&L $${realizedPnlUSD.toFixed(2)}`,
  }));
  persistPaperAccount(globalState);
};

export function useAuraStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...globalState,
    toggleLang,
    setTheme,
    setWorkspace,
    setSelectedSymbol,
    setTimeframe,
    setChartMode,
    toggleBollinger,
    toggleEMA,
    toggleAISignals,
    setZoomCount,
    setSelectedOrderBookPrice,
    setCommandOpen,
    toggleLiveStream,
    toggleAutoBot,
    triggerMarketShock,
    tickMarket,
    executeOrder,
    closePosition,
    applyBinanceTickerData,
    setBinanceConnected,
    hydratePaperAccount,
    resetPaperAccount,
  };
}

export default useAuraStore;