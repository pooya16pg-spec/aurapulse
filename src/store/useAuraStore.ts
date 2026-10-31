"use client";

import { useState, useEffect } from "react";

export type Lang = "fa" | "en";
export type AssetSymbol = "BTC/USD" | "ETH/USD" | "NVDA/AI" | "SOL/USD";
export type Timeframe = "1M" | "15M" | "1H" | "1D";
export type ChartMode = "CANDLE" | "AREA";

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  volatilityRisk: number;
  stepSize: number;
  candlesByTf: Record<Timeframe, CandlePoint[]>;
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
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
}

interface AuraState {
  lang: Lang;
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
  isAutoBotActive: boolean;
  lastNotification: string | null;
  balanceUSD: number;
  assets: Record<AssetSymbol, AssetInfo>;
  holdings: Record<AssetSymbol, number>;
  avgEntryPrices: Record<AssetSymbol, number>;
  orders: TradeOrder[];
}

// تولیدکننده اعداد شبه‌تصادفی پایدار برای جلوگیری از خطای Hydration در بیلد استاتیک
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildTimeframeCandles(
  basePrice: number,
  volatility: number,
  seedOffset: number,
  tfLabel: Timeframe
): CandlePoint[] {
  const list: CandlePoint[] = [];
  const count = 42;
  const tfMultiplier =
    tfLabel === "1M" ? 0.6 : tfLabel === "15M" ? 1.0 : tfLabel === "1H" ? 1.8 : 3.2;
  const vol = volatility * tfMultiplier;
  let current = basePrice * (1 - vol * 2.2);

  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(seedOffset + i * 13.7);
    const r2 = seededRandom(seedOffset + i * 29.3);
    const r3 = seededRandom(seedOffset + i * 53.1);

    const wave = Math.sin(i * 0.42 + seedOffset) * basePrice * vol * 0.65;
    const drift = (r1 - 0.475) * basePrice * vol * 1.1;

    const open = Number(current.toFixed(2));
    const close = Number(Math.max(basePrice * 0.4, open + wave * 0.35 + drift).toFixed(2));
    const bodySpan = Math.abs(close - open);
    const wickAdd = bodySpan * (0.4 + r2 * 0.9) + basePrice * vol * 0.25;

    const high = Number((Math.max(open, close) + wickAdd * (0.5 + r3 * 0.5)).toFixed(2));
    const low = Number((Math.min(open, close) - wickAdd * (0.5 + (1 - r3) * 0.5)).toFixed(2));
    const volume = Number((25 + r2 * 110).toFixed(1));

    let signal: "BUY" | "SELL" | undefined = undefined;
    if (i === 10 || i === 24 || i === 36) {
      signal = close >= open ? "BUY" : "SELL";
    }

    const mins = (i * (tfLabel === "1M" ? 1 : tfLabel === "15M" ? 15 : 60)) % 60;
    const hrs = (10 + Math.floor(i / 4)) % 24;
    const timeStr = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    list.push({ time: timeStr, open, high, low, close, volume, signal });
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

    const askPrice = Number((midPrice + i * step * (0.85 + rAsk * 0.35)).toFixed(2));
    const askSize = Number((0.45 + rAsk * 3.6).toFixed(3));
    askTotal = Number((askTotal + askSize).toFixed(3));
    asks.push({ price: askPrice, size: askSize, total: askTotal, depthPercent: 0 });

    const bidPrice = Number((midPrice - i * step * (0.85 + rBid * 0.35)).toFixed(2));
    const bidSize = Number((0.45 + rBid * 3.6).toFixed(3));
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
  basePrice: number,
  change24h: number,
  volume24h: string,
  volatilityRisk: number,
  stepSize: number,
  volFactor: number,
  seed: number
): AssetInfo {
  const candlesByTf: Record<Timeframe, CandlePoint[]> = {
    "1M": buildTimeframeCandles(basePrice, volFactor, seed + 10, "1M"),
    "15M": buildTimeframeCandles(basePrice, volFactor, seed + 20, "15M"),
    "1H": buildTimeframeCandles(basePrice, volFactor, seed + 30, "1H"),
    "1D": buildTimeframeCandles(basePrice, volFactor, seed + 40, "1D"),
  };

  const activeCandles = candlesByTf["15M"];
  const lastClose = activeCandles[activeCandles.length - 1].close;
  const { asks, bids } = buildOrderBook(lastClose, stepSize, seed);
  const highs = activeCandles.map((c) => c.high);
  const lows = activeCandles.map((c) => c.low);

  return {
    symbol,
    name,
    price: lastClose,
    change24h,
    high24h: Number((Math.max(...highs) * 1.003).toFixed(2)),
    low24h: Number((Math.min(...lows) * 0.997).toFixed(2)),
    volume24h,
    volatilityRisk,
    stepSize,
    candlesByTf,
    asks,
    bids,
  };
}

const INITIAL_ASSETS: Record<AssetSymbol, AssetInfo> = {
  "BTC/USD": makeAsset(
    "BTC/USD",
    { fa: "بیت‌کوین / تتر (پرپچوال کوانتومی)", en: "Bitcoin Quantum Perpetual" },
    94280.5,
    4.82,
    "$42.8B",
    34,
    14.0,
    0.0024,
    101
  ),
  "ETH/USD": makeAsset(
    "ETH/USD",
    { fa: "اتریوم / تتر (قرارداد هوشمند)", en: "Ethereum Institutional Perp" },
    3420.75,
    2.94,
    "$19.4B",
    42,
    1.5,
    0.0029,
    202
  ),
  "NVDA/AI": makeAsset(
    "NVDA/AI",
    { fa: "سهام انویدیا (شاخص هوش مصنوعی)", en: "NVIDIA AI Synthetic Index" },
    148.6,
    6.15,
    "$31.2B",
    28,
    0.18,
    0.0032,
    303
  ),
  "SOL/USD": makeAsset(
    "SOL/USD",
    { fa: "سولانا / تتر (فرکانس بالا)", en: "Solana High-Frequency Perp" },
    218.4,
    -1.35,
    "$9.7B",
    58,
    0.25,
    0.0038,
    404
  ),
};

let tickCounter = 0;

let globalState: AuraState = {
  lang: "fa",
  selectedSymbol: "BTC/USD",
  timeframe: "15M",
  chartMode: "CANDLE",
  showBollinger: true,
  showEMA: true,
  showAISignals: true,
  zoomCount: 28,
  selectedOrderBookPrice: null,
  isCommandOpen: false,
  isLiveStreamActive: true,
  isAutoBotActive: false,
  lastNotification: null,
  balanceUSD: 128500.0,
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

const toggleLang = () =>
  setState((state) => ({ lang: state.lang === "fa" ? "en" : "fa" }));

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
  setState(() => ({ zoomCount: Math.max(12, Math.min(42, count)) }));

const setSelectedOrderBookPrice = (price: number | null) =>
  setState(() => ({ selectedOrderBookPrice: price }));

const setCommandOpen = (open: boolean) =>
  setState(() => ({ isCommandOpen: open }));

const toggleLiveStream = () =>
  setState((state) => ({ isLiveStreamActive: !state.isLiveStreamActive }));

const toggleAutoBot = () =>
  setState((state) => {
    const next = !state.isAutoBotActive;
    return {
      isAutoBotActive: next,
      lastNotification: next
        ? state.lang === "fa"
          ? "🤖 ربات معامله‌گر خودکار کوانتومی فعال شد!"
          : "🤖 AI Auto-Quant Trading Bot Activated!"
        : state.lang === "fa"
        ? "ربات معامله‌گر خودکار متوقف شد."
        : "AI Auto-Quant Bot Paused.",
    };
  });

// شبیه‌ساز پامپ نهنگ‌ها یا ریزش ناگهانی بازار
const triggerMarketShock = (direction: "PUMP" | "CRASH") => {
  setState((state) => {
    const sym = state.selectedSymbol;
    const item = state.assets[sym];
    const tf = state.timeframe;
    const candles = [...item.candlesByTf[tf]];
    const last = candles[candles.length - 1];

    const factor = direction === "PUMP" ? 1.014 : 0.986;
    const nextClose = Number((last.close * factor).toFixed(2));
    const open = last.close;
    const high = Number((Math.max(open, nextClose) + item.stepSize * 2.5).toFixed(2));
    const low = Number((Math.min(open, nextClose) - item.stepSize * 1.2).toFixed(2));
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
      volume: 165.4,
      signal: direction === "PUMP" ? "BUY" : "SELL",
    };

    const nextCandles = [...candles.slice(1), shockCandle];
    const { asks, bids } = buildOrderBook(nextClose, item.stepSize, Date.now());

    return {
      lastNotification:
        direction === "PUMP"
          ? state.lang === "fa"
            ? `🚀 پامپ نهنگ‌ها روی ${sym} اعمال شد (+1.4% جهش آنی)`
            : `🚀 Whale Bull Shock injected into ${sym} (+1.4% surge)`
          : state.lang === "fa"
          ? `⚡ شوک ریزشی بازار روی ${sym} شبیه‌سازی شد (-1.4%)`
          : `⚡ Flash Crash Stress-Test triggered on ${sym} (-1.4%)`,
      assets: {
        ...state.assets,
        [sym]: {
          ...item,
          price: nextClose,
          change24h: Number(
            (item.change24h + (direction === "PUMP" ? 1.4 : -1.4)).toFixed(2)
          ),
          high24h: Math.max(item.high24h, high),
          low24h: Math.min(item.low24h, low),
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
  tickCounter++;
  setState((state) => {
    if (!state.isLiveStreamActive) return {};
    const updatedAssets = { ...state.assets };
    const tf = state.timeframe;
    const isNewCandleTick = tickCounter % 4 === 0;
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    (Object.keys(updatedAssets) as AssetSymbol[]).forEach((sym) => {
      const item = updatedAssets[sym];
      const candles = [...item.candlesByTf[tf]];
      const last = { ...candles[candles.length - 1] };

      const anchor = candles[0].open;
      const pullToCenter = (anchor - last.close) * 0.035;
      const shock = (Math.random() - 0.488) * item.price * 0.0022;
      const nextClose = Number(
        Math.max(item.stepSize * 5, last.close + pullToCenter + shock).toFixed(2)
      );

      let nextCandles: CandlePoint[];
      if (isNewCandleTick) {
        const open = last.close;
        const wick = Math.abs(nextClose - open) + item.stepSize * (0.6 + Math.random());
        const high = Number((Math.max(open, nextClose) + wick * 0.5).toFixed(2));
        const low = Number((Math.min(open, nextClose) - wick * 0.5).toFixed(2));
        const volume = Number((30 + Math.random() * 90).toFixed(1));
        const signal =
          Math.random() > 0.82 ? (nextClose >= open ? "BUY" : "SELL") : undefined;

        nextCandles = [
          ...candles.slice(1),
          { time: nowStr, open, high, low, close: nextClose, volume, signal },
        ];
      } else {
        // آپدیت نرم کندل فعلی بدون پرش کل نمودار
        last.close = nextClose;
        last.high = Number(Math.max(last.high, nextClose + item.stepSize * 0.3).toFixed(2));
        last.low = Number(Math.min(last.low, nextClose - item.stepSize * 0.3).toFixed(2));
        last.volume = Number((last.volume + Math.random() * 8).toFixed(1));
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
        change24h: Number((item.change24h + deltaPct * 0.6).toFixed(2)),
        high24h: Math.max(item.high24h, nextClose),
        low24h: Math.min(item.low24h, nextClose),
        candlesByTf: {
          ...item.candlesByTf,
          [tf]: nextCandles,
        },
        asks,
        bids,
      };
    });

    // اگر ربات خودکار روشن باشد، هر ۳ تیک یک معامله هوشمند ثبت می‌کند
    let nextOrders = state.orders;
    let nextHoldings = state.holdings;
    let nextBalance = state.balanceUSD;

    if (state.isAutoBotActive && tickCounter % 3 === 0 && state.balanceUSD > 600) {
      const activeSym = state.selectedSymbol;
      const activePrice = updatedAssets[activeSym].price;
      const tradeUSD = 500;
      const units = Number(((tradeUSD * 5) / activePrice).toFixed(4));
      const botOrder: TradeOrder = {
        id: `BOT-${Math.floor(1000 + Math.random() * 9000)}`,
        symbol: activeSym,
        side: "BUY",
        amount: units,
        leverage: 5,
        executionPrice: activePrice,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        tag: "AI-BOT",
      };
      nextBalance = Number((state.balanceUSD - tradeUSD).toFixed(2));
      nextHoldings = {
        ...state.holdings,
        [activeSym]: Number((state.holdings[activeSym] + units).toFixed(4)),
      };
      nextOrders = [botOrder, ...state.orders.slice(0, 14)];
    }

    return {
      assets: updatedAssets,
      balanceUSD: nextBalance,
      holdings: nextHoldings,
      orders: nextOrders,
    };
  });
};

const executeOrder = (
  side: "BUY" | "SELL",
  usdAmount: number,
  leverage = 1
): boolean => {
  const sym = globalState.selectedSymbol;
  const activeAsset = globalState.assets[sym];
  if (usdAmount <= 0) return false;

  const execPrice = globalState.selectedOrderBookPrice || activeAsset.price;
  const units = Number(((usdAmount * leverage) / execPrice).toFixed(4));

  if (side === "BUY") {
    if (globalState.balanceUSD < usdAmount) return false;
    const prevQty = globalState.holdings[sym];
    const prevAvg = globalState.avgEntryPrices[sym];
    const newQty = Number((prevQty + units).toFixed(4));
    const newAvg =
      newQty > 0
        ? Number(((prevQty * prevAvg + units * execPrice) / newQty).toFixed(2))
        : execPrice;

    const newOrder: TradeOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: sym,
      side: "BUY",
      amount: units,
      leverage,
      executionPrice: execPrice,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      tag: "MANUAL",
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD - usdAmount).toFixed(2)),
      holdings: { ...state.holdings, [sym]: newQty },
      avgEntryPrices: { ...state.avgEntryPrices, [sym]: newAvg },
      orders: [newOrder, ...state.orders.slice(0, 14)],
    }));
    return true;
  } else {
    const currentUnits = globalState.holdings[sym];
    const sellUnits = Number((usdAmount / execPrice).toFixed(4));
    if (currentUnits <= 0) return false;
    const actualSell = Math.min(currentUnits, sellUnits);
    const realizedUSD = Number((actualSell * execPrice).toFixed(2));

    const newOrder: TradeOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: sym,
      side: "SELL",
      amount: Number(actualSell.toFixed(4)),
      leverage,
      executionPrice: execPrice,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      tag: "MANUAL",
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD + realizedUSD).toFixed(2)),
      holdings: {
        ...state.holdings,
        [sym]: Number(Math.max(0, currentUnits - actualSell).toFixed(4)),
      },
      orders: [newOrder, ...state.orders.slice(0, 14)],
    }));
    return true;
  }
};

const closePosition = (sym: AssetSymbol) => {
  const qty = globalState.holdings[sym];
  if (qty <= 0) return;
  const price = globalState.assets[sym].price;
  const usdValue = Number((qty * price).toFixed(2));

  const closeOrd: TradeOrder = {
    id: `CLS-${Math.floor(1000 + Math.random() * 9000)}`,
    symbol: sym,
    side: "SELL",
    amount: qty,
    leverage: 1,
    executionPrice: price,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    tag: "TAKE-PROFIT",
  };

  setState((state) => ({
    balanceUSD: Number((state.balanceUSD + usdValue).toFixed(2)),
    holdings: { ...state.holdings, [sym]: 0 },
    orders: [closeOrd, ...state.orders.slice(0, 14)],
    lastNotification:
      state.lang === "fa"
        ? `✅ پوزیشن ${sym} به ارزش $${usdValue.toLocaleString("en-US")} نقد و تسویه شد!`
        : `✅ Closed ${sym} position for $${usdValue.toLocaleString("en-US")}!`,
  }));
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
  };
}

export default useAuraStore;