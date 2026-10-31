import type { Metadata, Viewport } from "next";
// @ts-ignore
import "./globals.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#020408" };

export const metadata: Metadata = {
  title: "AuraPulse | Pooya Goodarzi — FinTech & Quant Analytics Terminal",
  description:
    "Responsive market-data and local paper-trading workspace by Pooya Goodarzi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Vazirmatn:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Vazirmatn', sans-serif" }}>{children}</body>
    </html>
  );
}