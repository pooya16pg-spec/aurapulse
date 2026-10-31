# AuraPulse — Quantitative FinTech & Paper Trading Terminal
**Lead Architect:** Pooya Goodarzi (Computer Engineering)  
**Live Demo:** [https://pooya16pg-spec.github.io/aurapulse/](https://pooya16pg-spec.github.io/aurapulse/)

## Engineering Case Study
1. **Live Market API Integration + Fallback Engine:** Connects to public crypto market ticker feeds (Binance / CoinGecko REST endpoints) for real-time BTC/ETH/SOL spot pricing with seamless fallback to a deterministic mean-reverting stochastic model.
2. **Persistent Paper Trading Engine:** Full optimistic order execution (1x–25x leverage), liquidation threshold calculation, and `localStorage` state persistence.
3. **Zero-Dependency Pure SVG Vector Charting:** Renders OHLC Candlesticks, Bollinger Bands (20, 2), EMA 9/21, and RSI(14) without canvas blur on high-DPI Android displays.