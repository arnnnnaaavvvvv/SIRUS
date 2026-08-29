"use client";

import React from "react";

const VENUES = [
  { name: "Zerodha Kite", type: "NSE/BSE Demat", tag: "Kite Connect" },
  { name: "Alpaca Markets", type: "US Equities & Fractional", tag: "DMA REST/WS" },
  { name: "KuCoin Exchange", type: "Crypto Spot & Derivatives", tag: "Sub-account API" },
  { name: "Interactive Brokers", type: "Global Stocks & Options", tag: "TWS / Web API" },
  { name: "AngelOne", type: "SmartAPI Algo Trading", tag: "Demat" },
  { name: "Upstox Pro", type: "Indian Equities & F&O", tag: "v2 API" },
  { name: "Groww Stocks", type: "Demat & Portfolio", tag: "OAuth Sync" },
  { name: "Binance Global", type: "Crypto Derivatives", tag: "Fast FIX" },
];

export default function LogoCloud() {
  return (
    <section className="py-14 border-y border-border bg-[#0f1515]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-8 text-center">
        <span className="text-sm font-medium text-muted-foreground">
          Built for direct market access &amp; liquidity venue integration
        </span>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="relative w-full overflow-hidden">
        {/* Left / Right gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0f1515] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0f1515] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...VENUES, ...VENUES].map((venue, idx) => (
            <div
              key={idx}
              className="inline-flex items-center space-x-3 px-5 py-3 mx-2 rounded-lg bg-[#182222]/60 border border-border hover:border-border-light transition-all cursor-default"
            >
              <div className="w-8 h-8 rounded-md bg-[#0f1515] border border-border flex items-center justify-center font-bold text-[#fff800] text-xs font-mono">
                {venue.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white">{venue.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{venue.type}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#0f1515] text-[#fff800] border border-border">
                {venue.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
