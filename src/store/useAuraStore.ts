"use client";

import { useState, useEffect } from "react";

export type Lang = "fa" | "en";
export type AssetSymbol = "BTC/USD" | "ETH/USD" | "NVDA/AI" | "SOL/USD";
export type Timeframe = "1M" | "15M" | "1H" | "1D";

export interface AssetInfo {
  symbol: AssetSymbol;
  name: { fa: string; en: string };
  price: number;
  change24h: number;
  volume24h: string;
  volatilityRisk: number;
  history: number[];
}

export interface TradeOrder {
  id: string;
  symbol: AssetSymbol;
  side: "BUY" | "SELL";
  amount: number;
  executionPrice: number;
  timestamp: string;
}

interface AuraState {
  lang: Lang;
  selectedSymbol: AssetSymbol;
  timeframe: Timeframe;
  isCommandOpen: boolean;
  isLiveStreamActive: boolean;
  balanceUSD: number;
  assets: Record<AssetSymbol, AssetInfo>;
  holdings: Record<AssetSymbol, number>;
  orders: TradeOrder[];
}

const INITIAL_ASSETS: Record<AssetSymbol, AssetInfo> = {
  "BTC/USD": {
    symbol: "BTC/USD",
    name: { fa: "بیت‌کوین / تتر", en: "Bitcoin Perpetual" },
    price: 94280.5,
    change24h: 4.82,
    volume24h: "$42.8B",
    volatilityRisk: 38,
    history: [
      93100, 93240, 93180, 93450, 93600, 93520, 93780, 93900, 93840, 94050,
      94120, 93980, 94190, 94310, 94220, 94280.5,
    ],
  },
  "ETH/USD": {
    symbol: "ETH/USD",
    name: { fa: "اتریوم / تتر", en: "Ethereum Quantum" },
    price: 3420.75,
    change24h: 2.94,
    volume24h: "$19.4B",
    volatilityRisk: 44,
    history: [
      3310, 3325, 3340, 3330, 3355, 3370, 3362, 3385, 3395, 3388, 3402, 3415,
      3408, 3418, 3412, 3420.75,
    ],
  },
  "NVDA/AI": {
    symbol: "NVDA/AI",
    name: { fa: "سهام انویدیا (توکنایز شده)", en: "NVIDIA Synthetic Index" },
    price: 148.6,
    change24h: 6.15,
    volume24h: "$31.2B",
    volatilityRisk: 29,
    history: [
      141.2, 142.0, 142.5, 143.1, 142.8, 144.0, 144.6, 145.2, 145.9, 146.4,
      146.1, 147.0, 147.8, 148.1, 148.3, 148.6,
    ],
  },
  "SOL/USD": {
    symbol: "SOL/USD",
    name: { fa: "سولانا / تتر", en: "Solana High-Freq" },
    price: 218.4,
    change24h: -1.35,
    volume24h: "$9.7B",
    volatilityRisk: 64,
    history: [
      222.5, 221.8, 222.1, 220.9, 220.2, 221.0, 219.8, 219.4, 220.1, 218.9,
      219.2, 218.5, 218.8, 218.1, 218.6, 218.4,
    ],
  },
};

let globalState: AuraState = {
  lang: "fa",
  selectedSymbol: "BTC/USD",
  timeframe: "15M",
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
  orders: [
    {
      id: "ORD-9041",
      symbol: "BTC/USD",
      side: "BUY",
      amount: 0.25,
      executionPrice: 93420.0,
      timestamp: "14:22:10",
    },
    {
      id: "ORD-9040",
      symbol: "NVDA/AI",
      side: "BUY",
      amount: 50,
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

const toggleLang = () => {
  setState((state) => ({ lang: state.lang === "fa" ? "en" : "fa" }));
};

const setSelectedSymbol = (sym: AssetSymbol) => {
  setState(() => ({ selectedSymbol: sym }));
};

const setTimeframe = (tf: Timeframe) => {
  setState(() => ({ timeframe: tf }));
};

const setCommandOpen = (open: boolean) => {
  setState(() => ({ isCommandOpen: open }));
};

const toggleLiveStream = () => {
  setState((state) => ({ isLiveStreamActive: !state.isLiveStreamActive }));
};

const tickMarket = () => {
  setState((state) => {
    if (!state.isLiveStreamActive) return {};
    const updatedAssets = { ...state.assets };

    (Object.keys(updatedAssets) as AssetSymbol[]).forEach((sym) => {
      const item = updatedAssets[sym];
      const deltaPercent = (Math.random() - 0.485) * 0.0045;
      const nextPrice = Number(
        Math.max(1, item.price * (1 + deltaPercent)).toFixed(2)
      );
      const nextChange = Number(
        (item.change24h + deltaPercent * 45).toFixed(2)
      );
      const nextHistory = [...item.history.slice(1), nextPrice];

      updatedAssets[sym] = {
        ...item,
        price: nextPrice,
        change24h: nextChange,
        history: nextHistory,
      };
    });

    return { assets: updatedAssets };
  });
};

const executeOrder = (side: "BUY" | "SELL", usdAmount: number): boolean => {
  const activeAsset = globalState.assets[globalState.selectedSymbol];
  if (usdAmount <= 0) return false;

  const units = Number((usdAmount / activeAsset.price).toFixed(4));

  if (side === "BUY") {
    if (globalState.balanceUSD < usdAmount) return false;
    const newOrder: TradeOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: globalState.selectedSymbol,
      side: "BUY",
      amount: units,
      executionPrice: activeAsset.price,
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
      orders: [newOrder, ...state.orders.slice(0, 9)],
    }));
    return true;
  } else {
    const currentUnits = globalState.holdings[globalState.selectedSymbol];
    if (currentUnits < units) return false;

    const newOrder: TradeOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: globalState.selectedSymbol,
      side: "SELL",
      amount: units,
      executionPrice: activeAsset.price,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    };

    setState((state) => ({
      balanceUSD: Number((state.balanceUSD + usdAmount).toFixed(2)),
      holdings: {
        ...state.holdings,
        [state.selectedSymbol]: Number((currentUnits - units).toFixed(4)),
      },
      orders: [newOrder, ...state.orders.slice(0, 9)],
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
    setCommandOpen,
    toggleLiveStream,
    tickMarket,
    executeOrder,
  };
}

export default useAuraStore;