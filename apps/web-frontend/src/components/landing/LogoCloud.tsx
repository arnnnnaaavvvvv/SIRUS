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
    <section className="py-12 border-y border-white/[0.06] bg-slate-950/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Native Direct Market Access &amp; Liquidity Integrations
        </p>
      </div>

      {/* Infinite Scrolling Marquee */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient Mask on left and right */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050814] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050814] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {[...VENUES, ...VENUES].map((venue, idx) => (
            <div
              key={idx}
              className="inline-flex items-center space-x-3 px-6 py-3 mx-2 rounded-2xl bg-slate-900/60 border border-white/[0.06] hover:border-cyan-500/30 transition-all cursor-default"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-xs font-mono">
                {venue.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">{venue.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{venue.type}</div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/20">
                {venue.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
