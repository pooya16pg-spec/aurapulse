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
  fundingRate: string;
  openInterest: string;
  volatilityRisk: number;
  stepSize: number;
  candles: CandlePoint[];
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
}

interface AuraState {
  lang: Lang;
  selectedSymbol: AssetSymbol;
  timeframe: Timeframe;
  chartMode: ChartMode;
  zoomCount: number;
  selectedOrderBookPrice: number | null;
  isCommandOpen: boolean;
  isLiveStreamActive: boolean;
  balanceUSD: number;
  assets: Record<AssetSymbol, AssetInfo>;
  holdings: Record<AssetSymbol, number>;
  avgEntryPrices: Record<AssetSymbol, number>;
  orders: TradeOrder[];
}

function generateCandles(basePrice: number, volatility: number, count = 48): CandlePoint[] {
  const list: CandlePoint[] = [];
  let current = basePrice * (1 - volatility * 4);
  const now = Date.now();

  for (let i = count; i >= 1; i--) {
    const t = new Date(now - i * 60000);
    const timeStr = t.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const wave = Math.sin(i * 0.35) * basePrice * volatility * 0.55;
    const noise = (Math.random() - 0.48) * basePrice * volatility;
    const open = Number(current.toFixed(2));
    const close = Number(Math.max(basePrice * 0.5, open + wave * 0.25 + noise).toFixed(2));
    const spread = Math.abs(close - open) + basePrice * volatility * (0.35 + Math.random() * 0.5);
    const high = Number((Math.max(open, close) + spread * 0.6).toFixed(2));
    const low = Number((Math.min(open, close) - spread * 0.6).toFixed(2));
    const volume = Number((18 + Math.random() * 95).toFixed(1));

    list.push({ time: timeStr, open, high, low, close, volume });
    current = close;
  }
  return list;
}

function generateOrderBook(midPrice: number, step: number): {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
} {
  const asks: OrderBookLevel[] = [];
  const bids: OrderBookLevel[] = [];
  let askTotal = 0;
  let bidTotal = 0;

  for (let i = 1; i <= 8; i++) {
    const askPrice = Number((midPrice + i * step * (0.8 + Math.random() * 0.4)).toFixed(2));
    const askSize = Number((0.4 + Math.random() * 3.8).toFixed(3));
    askTotal = Number((askTotal + askSize).toFixed(3));
    asks.push({ price: askPrice, size: askSize, total: askTotal, depthPercent: 0 });

    const bidPrice = Number((midPrice - i * step * (0.8 + Math.random() * 0.4)).toFixed(2));
    const bidSize = Number((0.4 + Math.random() * 3.8).toFixed(3));
    bidTotal = Number((bidTotal + bidSize).toFixed(3));
    bids.push({ price: bidPrice, size: bidSize, total: bidTotal, depthPercent: 0 });
  }

  const maxTotal = Math.max(askTotal, bidTotal, 1);
  asks.forEach((a) => (a.depthPercent = Math.min(100, Math.round((a.total / maxTotal) * 100))));
  bids.forEach((b) => (b.depthPercent = Math.min(100, Math.round((b.total / maxTotal) * 100))));

  return { asks: asks.reverse(), bids };
}

function createInitialAsset(
  symbol: AssetSymbol,
  name: { fa: string; en: string },
  price: number,
  change24h: number,
  volume24h: string,
  volatilityRisk: number,
  stepSize: number,
  volFactor: number
): AssetInfo {
  const candles = generateCandles(price, volFactor, 48);
  const lastClose = candles[candles.length - 1].close;
  const { asks, bids } = generateOrderBook(lastClose, stepSize);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  return {
    symbol,
    name,
    price: lastClose,
    change24h,
    high24h: Number((Math.max(...highs) * 1.004).toFixed(2)),
    low24h: Number((Math.min(...lows) * 0.996).toFixed(2)),
    volume24h,
    fundingRate: "+0.0124%",
    openInterest: "$1.84B",
    volatilityRisk,
    stepSize,
    candles,
    asks,
    bids,
  };
}

const INITIAL_ASSETS: Record<AssetSymbol, AssetInfo> = {
  "BTC/USD": createInitialAsset(
    "BTC/USD",
    { fa: "بیت‌کوین / تتر (پرپچوال)", en: "Bitcoin Perpetual Futures" },
    94280.5,
    4.82,
    "$42.8B",
    34,
    12.5,
    0.0022
  ),
  "ETH/USD": createInitialAsset(
    "ETH/USD",
    { fa: "اتریوم / تتر (کوانتوم)", en: "Ethereum Quantum Index" },
    3420.75,
    2.94,
    "$19.4B",
    42,
    1.25,
    0.0028
  ),
  "NVDA/AI": createInitialAsset(
    "NVDA/AI",
    { fa: "سهام انویدیا (توکنایز شده)", en: "NVIDIA Synthetic AI Perp" },
    148.6,
    6.15,
    "$31.2B",
    28,
    0.15,
    0.0032
  ),
  "SOL/USD": createInitialAsset(
    "SOL/USD",
    { fa: "سولانا / تتر (فرکانس بالا)", en: "Solana High-Freq Perp" },
    218.4,
    -1.35,
    "$9.7B",
    61,
    0.2,
    0.0038
  ),
};

let globalState: AuraState = {
  lang: "fa",
  selectedSymbol: "BTC/USD",
  timeframe: "15M",
  chartMode: "CANDLE",
  zoomCount: 32,
  selectedOrderBookPrice: null,
  isCommandOpen: false,
  isLiveStreamActive: true,
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
    "SOL/USD": 221.5,
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
    },
    {
      id: "ORD-9040",
      symbol: "NVDA/AI",
      side: "BUY",
      amount: 50,
      leverage: 2,
      executionPrice: 145.8,
      timestamp: "13:50:44",
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

const setZoomCount = (count: number) =>
  setState(() => ({ zoomCount: Math.max(14, Math.min(48, count)) }));

const setSelectedOrderBookPrice = (price: number | null) =>
  setState(() => ({ selectedOrderBookPrice: price }));

const setCommandOpen = (open: boolean) =>
  setState(() => ({ isCommandOpen: open }));

const toggleLiveStream = () =>
  setState((state) => ({ isLiveStreamActive: !state.isLiveStreamActive }));

const tickMarket = () => {
  setState((state) => {
    if (!state.isLiveStreamActive) return {};
    const updatedAssets = { ...state.assets };
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    (Object.keys(updatedAssets) as AssetSymbol[]).forEach((sym) => {
      const item = updatedAssets[sym];
      const candles = [...item.candles];
      const prevCandle = candles[candles.length - 1];

      // نوسان استاندارد و متوازن حول میانگین تا نمودار هرگز گم نشود
      const firstOpen = candles[0].open;
      const meanReversion = (firstOpen - prevCandle.close) * 0.04;
      const randomShock = (Math.random() - 0.492) * item.price * 0.0024;
      const nextClose = Number(
        Math.max(item.stepSize * 5, prevCandle.close + meanReversion + randomShock).toFixed(2)
      );

      const open = prevCandle.close;
      const wickRange = Math.abs(nextClose - open) + item.stepSize * (0.7 + Math.random() * 1.4);
      const high = Number((Math.max(open, nextClose) + wickRange * 0.55).toFixed(2));
      const low = Number((Math.min(open, nextClose) - wickRange * 0.55).toFixed(2));
      const volume = Number((22 + Math.random() * 88).toFixed(1));

      const nextCandles = [
        ...candles.slice(1),
        { time: nowStr, open, high, low, close: nextClose, volume },
      ];

      const deltaPct = ((nextClose - prevCandle.close) / prevCandle.close) * 100;
      const nextChange = Number((item.change24h + deltaPct * 0.8).toFixed(2));
      const { asks, bids } = generateOrderBook(nextClose, item.stepSize);

      updatedAssets[sym] = {
        ...item,
        price: nextClose,
        change24h: nextChange,
        high24h: Math.max(item.high24h, high),
        low24h: Math.min(item.low24h, low),
        candles: nextCandles,
        asks,
        bids,
      };
    });

    return { assets: updatedAssets };
  });
};

const executeOrder = (
  side: "BUY" | "SELL",
  usdAmount: number,
  leverage = 1
): boolean => {
  const activeAsset = globalState.assets[globalState.selectedSymbol];
  if (usdAmount <= 0) return false;

  const execPrice = globalState.selectedOrderBookPrice || activeAsset.price;
  const units = Number(((usdAmount * leverage) / execPrice).toFixed(4));

  if (side === "BUY") {
    if (globalState.balanceUSD < usdAmount) return false;
    const newOrder: TradeOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: globalState.selectedSymbol,
      side: "BUY",
      amount: units,
      leverage,
      executionPrice: execPrice,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD - usdAmount).toFixed(2)),
      holdings: {
        ...state.holdings,
        [state.selectedSymbol]: Number(
          (state.holdings[state.selectedSymbol] + units).toFixed(4)
        ),
      },
      orders: [newOrder, ...state.orders.slice(0, 14)],
    }));
    return true;
  } else {
    const currentUnits = globalState.holdings[globalState.selectedSymbol];
    const sellUnits = Number((usdAmount / execPrice).toFixed(4));
    if (currentUnits < sellUnits) return false;

    const newOrder: TradeOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: globalState.selectedSymbol,
      side: "SELL",
      amount: sellUnits,
      leverage: 1,
      executionPrice: execPrice,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD + usdAmount).toFixed(2)),
      holdings: {
        ...state.holdings,
        [state.selectedSymbol]: Number((currentUnits - sellUnits).toFixed(4)),
      },
      orders: [newOrder, ...state.orders.slice(0, 14)],
    }));
    return true;
  }
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
    setZoomCount,
    setSelectedOrderBookPrice,
    setCommandOpen,
    toggleLiveStream,
    tickMarket,
    executeOrder,
  };
}

export default useAuraStore;