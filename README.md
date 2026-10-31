# AuraPulse — Market Dashboard & Paper-Trading Simulator

**Author:** Pooya Goodarzi  
**Live site:** https://pooya16pg-spec.github.io/aurapulse/

AuraPulse is a browser-only market dashboard and paper-trading demonstration.

## Market data
- The app polls Binance's public 24-hour ticker endpoint for BTC, ETH, and SOL.
- The feed is read-only. If the request is blocked, unavailable, or rate-limited, the interface marks the market as simulated and falls back to its local price model.
- `NVDA/AI` is a synthetic demo instrument, not a listed Binance symbol.
- The initial portfolio, historical candles, order book depth, AI-style signals, and demo logs are illustrative. They are not institutional exchange data.

## Paper trading
- Orders update an in-memory browser demo account only.
- No real trades, exchange credentials, deposits, withdrawals, liquidation engine, persistent storage, or private API are implemented.
- The local demo bot simulates spot buys. It does not execute an autonomous strategy against an exchange.

## Technology
- Next.js 14 static export, React 18, TypeScript, and Tailwind CSS.
- Custom SVG candlestick visualization with EMA, Bollinger, volume, and RSI display layers.
- Public Binance ticker requests originate from the visitor's browser; feed access depends on network and endpoint availability.

**Important:** This project is an educational UI prototype, not an investment tool or a source of financial advice.
