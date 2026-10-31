# AuraPulse — Market Data & Paper-Trading Studio

**Author:** Pooya Goodarzi  
**Live site:** https://pooya16pg-spec.github.io/aurapulse/

AuraPulse is a browser-first market dashboard that separates public market quotes from an educational paper-trading simulator.

## Market data
- Reads public 24-hour ticker data for BTC, ETH, and SOL from Binance when the browser can reach the endpoint.
- Shows the connection state and falls back to clearly labelled illustrative data when the feed is unavailable.
- NVDA/AI is a synthetic demo instrument, not an exchange-listed product in this app.
- Seeded candle history, order-book depth, buy/sell pressure, and AI-style markers are illustrative rather than exchange market depth or institutional flow.

## Paper-trading account
- Orders are local browser calculations; no API key or exchange order endpoint is used.
- The demo account supports buy/sell fills, average entry prices, position valuation, realized and unrealized P&L, and a transparent 0.10% illustrative fee assumption.
- Paper account balance, positions, average entries, and order history are saved in browser localStorage on this device/browser.
- Use **Reset demo account** to return to the seeded starter account.
- Clearing browser storage or using another browser/device starts a separate account.

## Explore
- Switch symbols and chart intervals; inspect candlesticks and SVG indicators.
- Pause the local simulator independently of the public ticker polling.
- Place paper orders and inspect their fee and P&L effects.
- Review portfolio equity and reset the local paper account.

## Stack and deployment
Next.js 16 static export, React 19, TypeScript, SVG charting, and client-side state. The app is hosted on GitHub Pages; there is no backend account, private exchange API, real order execution, or cross-device persistence.
