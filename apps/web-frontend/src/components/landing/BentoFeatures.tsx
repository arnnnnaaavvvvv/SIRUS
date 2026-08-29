"use client";

import React from "react";
import { Globe2, Sliders } from "lucide-react";

export default function BentoFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-[32px] leading-[36px] md:text-[56px] md:leading-[60px] tracking-[-1.6px] font-medium text-white">
            Everything you need to automate your systematic edge.
          </h2>
          <p className="text-[16px] leading-[26px] text-muted-foreground">
            Engineered with high-throughput microservices, sub-millisecond async order routing, and enterprise-grade risk isolation.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 120+ Assets */}
          <div className="md:col-span-1 rounded-lg bg-[#0f1515]/70 backdrop-blur-[6px] p-8 border border-border flex flex-col justify-between space-y-6 pricing-card-border">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#182222] border border-border flex items-center justify-center text-[#fff800]">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold text-white tracking-tight">
                120+ Global Market Instruments
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect real-time market data across US Equities (NASDAQ/NYSE), Indian Markets (NSE/BSE), European Euronext/XETRA, Asian indices, Crypto, and Commodities.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {["US Equities", "NSE/BSE Demat", "Crypto Spot", "Futures & F&O", "Forex Majors", "Commodities"].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-sm text-xs font-mono bg-[#182222] text-[#fff800] border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Strategy Studio */}
          <div className="md:col-span-2 rounded-lg bg-[#0f1515]/70 backdrop-blur-[6px] p-8 border border-border flex flex-col justify-between space-y-6 pricing-card-border">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#182222] border border-border flex items-center justify-center text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-semibold text-white tracking-tight">
                9+ Algorithmic Primitives &amp; Dynamic Strategy Studio
              </h3>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                Deploy Moving Average Crossovers, RSI Mean Reversions, Donchian Momentum Breakouts, Bollinger Reversals, and Institutional VWAP strategies with 1-click execution or build custom AST trees.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { name: "MA Crossover", desc: "Dual EMA trend filter" },
                { name: "RSI Reversion", desc: "Overbought / Oversold" },
                { name: "Donchian Breakout", desc: "Multi-day channel high" },
                { name: "Bollinger Reversal", desc: "Statistical std-dev mean" },
                { name: "VWAP Institutional", desc: "Volume weighted anchors" },
                { name: "Dynamic AST Engine", desc: "Visual condition builder" },
              ].map((stg, i) => (
                <div key={i} className="p-3.5 rounded-md bg-[#182222]/50 border border-border">
                  <div className="text-xs font-bold text-white">{stg.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{stg.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
