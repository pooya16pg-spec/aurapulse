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
  isAutoBotActive: boolean;
  lastNotification: string | null;
  aiLogs: string[];
  balanceUSD: number;
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

let tickCounter = 0;

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
  isAutoBotActive: false,
  lastNotification: null,
  aiLogs: [
    "[14:22:01] QUANT-CORE :: Connected to L2 Institutional Liquidity Pool (0.3ms)",
    "[14:22:05] ORDER-FLOW :: Whale accumulation detected on BTC/USD (+2.8σ)",
    "[14:22:09] ALPHA-RADAR :: NVDA/AI synthetic momentum crossed EMA-21 threshold",
    "[14:22:14] RISK-ENGINE :: Portfolio Sharpe Ratio stabilized at 3.48 (Optimal)",
  ],
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

const toggleAutoBot = () =>
  setState((state) => {
    const next = !state.isAutoBotActive;
    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    return {
      isAutoBotActive: next,
      aiLogs: [
        `[${now}] AUTO-BOT :: ${
          next
            ? "Autonomous Neural Execution Engine ENABLED (5x Scalping Mode)"
            : "Autonomous Engine PAUSED by user"
        }`,
        ...state.aiLogs.slice(0, 12),
      ],
      lastNotification: next
        ? state.lang === "fa"
          ? "🤖 ربات معامله‌گر خودکار کوانتومی فعال شد و هر چند ثانیه ترید می‌کند!"
          : "🤖 AI Auto-Quant Trading Bot Activated!"
        : state.lang === "fa"
        ? "ربات معامله‌گر خودکار متوقف شد."
        : "AI Auto-Quant Bot Paused.",
    };
  });

const triggerMarketShock = (direction: "PUMP" | "CRASH") => {
  setState((state) => {
    const sym = state.selectedSymbol;
    const item = state.assets[sym];
    const tf = state.timeframe;
    const candles = [...item.candlesByTf[tf]];
    const last = candles[candles.length - 1];

    // جهش استاندارد متناسب با گام نمودار تا مقیاس سایر کندل‌ها خراب نشود
    const move =
      (direction === "PUMP" ? 1 : -1) * item.stepSize * 3.2;
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
            ? `🚀 موج خرید نهنگ‌ها روی ${sym} تزریق شد (قیمت جدید: $${nextClose.toLocaleString("en-US")})`
            : `🚀 Whale Bull Wave injected into ${sym} ($${nextClose.toLocaleString("en-US")})`
          : state.lang === "fa"
          ? `⚡ تست استرس ریزش روی ${sym} اعمال شد (قیمت جدید: $${nextClose.toLocaleString("en-US")})`
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
    const isNewCandleTick = tickCounter % 3 === 0;
    const nowStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    (Object.keys(updatedAssets) as AssetSymbol[]).forEach((sym) => {
      const item = updatedAssets[sym];
      const candles = [...item.candlesByTf[tf]];
      const last = { ...candles[candles.length - 1] };

      // میانگین ۱۰ کندل آخر برای حفظ تعادل طبیعی نمودار
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
      nextLogs = [
        `[${nowStr}] AI-BOT :: Executed 5x LONG on ${activeSym} (${units} units @ $${activePrice})`,
        ...state.aiLogs.slice(0, 12),
      ];
    }

    return {
      assets: updatedAssets,
      balanceUSD: nextBalance,
      holdings: nextHoldings,
      orders: nextOrders,
      aiLogs: nextLogs,
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
  const nowStr = new Date().toLocaleTimeString("en-US", { hour12: false });

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
      timestamp: nowStr,
      tag: "MANUAL",
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD - usdAmount).toFixed(2)),
      holdings: { ...state.holdings, [sym]: newQty },
      avgEntryPrices: { ...state.avgEntryPrices, [sym]: newAvg },
      orders: [newOrder, ...state.orders.slice(0, 14)],
      aiLogs: [
        `[${nowStr}] ORDER-FILL :: BUY ${units} ${sym} (${leverage}x) filled @ $${execPrice}`,
        ...state.aiLogs.slice(0, 12),
      ],
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
      timestamp: nowStr,
      tag: "MANUAL",
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD + realizedUSD).toFixed(2)),
      holdings: {
        ...state.holdings,
        [sym]: Number(Math.max(0, currentUnits - actualSell).toFixed(4)),
      },
      orders: [newOrder, ...state.orders.slice(0, 14)],
      aiLogs: [
        `[${nowStr}] ORDER-FILL :: SELL ${actualSell.toFixed(4)} ${sym} filled @ $${execPrice}`,
        ...state.aiLogs.slice(0, 12),
      ],
    }));
    return true;
  }
};

const closePosition = (sym: AssetSymbol) => {
  const qty = globalState.holdings[sym];
  if (qty <= 0) return;
  const price = globalState.assets[sym].price;
  const usdValue = Number((qty * price).toFixed(2));
  const nowStr = new Date().toLocaleTimeString("en-US", { hour12: false });

  const closeOrd: TradeOrder = {
    id: `CLS-${Math.floor(1000 + Math.random() * 9000)}`,
    symbol: sym,
    side: "SELL",
    amount: qty,
    leverage: 1,
    executionPrice: price,
    timestamp: nowStr,
    tag: "TAKE-PROFIT",
  };

  setState((state) => ({
    balanceUSD: Number((state.balanceUSD + usdValue).toFixed(2)),
    holdings: { ...state.holdings, [sym]: 0 },
    orders: [closeOrd, ...state.orders.slice(0, 14)],
    lastNotification:
      state.lang === "fa"
        ? `✅ پوزیشن ${sym} به ارزش $${usdValue.toLocaleString("en-US")} با موفقیت تسویه و به موجودی نقد اضافه شد!`
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
  };
}

export default useAuraStore;