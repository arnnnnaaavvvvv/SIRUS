"use client";

import React from "react";
import Link from "next/link";
import {
  Cpu,
  ShieldCheck,
  Globe2,
  Zap,
  Sliders,
  Sparkles,
  ArrowRight,
  Lock,
  LineChart,
  Activity,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function BentoFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-glow-cyan text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architected for Quantitative Dominance</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything You Need to <span className="text-gradient-cyan">Automate Your Edge</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered with a high-throughput microservices architecture, sub-millisecond async order routing, and enterprise-grade risk isolation.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Vectorized Backtester (Col-span 2) */}
          <div className="md:col-span-2 launch-card rounded-3xl p-8 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Vectorized Sub-100ms Strategy Backtesting Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Simulate years of tick-by-tick orderbook data in seconds using vectorized NumPy/Pandas pipelines and multi-threaded CPU execution. Test Walk-Forward optimizations and Monte Carlo risk scenarios before committing real capital.
              </p>
            </div>

            {/* Visual Graphic inside card */}
            <div className="mt-8 p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block">Win Rate</span>
                <span className="text-base font-bold text-emerald-400">68.5%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block">Sharpe Ratio</span>
                <span className="text-base font-bold text-cyan-400">2.15</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block">Max Drawdown</span>
                <span className="text-base font-bold text-rose-400">-3.8%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04]">
                <span className="text-[10px] text-slate-400 block">Sim Speed</span>
                <span className="text-base font-bold text-purple-400">540k ticks/s</span>
              </div>
            </div>
          </div>

          {/* Card 2: Multi-Tenant Vault Security */}
          <div className="launch-card rounded-3xl p-8 border border-white/[0.08] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                AES-256 Envelope Encrypted Vault
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Demat API keys and access tokens are sealed with master envelope keys. Plaintext secrets exist solely in isolated RAM during active order execution and are never logged.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs font-mono text-slate-300">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Zero Plaintext Disk Writes</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Isolated Per-Tenant Partitioning</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>OAuth 2.0 &amp; TOTP 2FA Verification</span>
              </div>
            </div>
          </div>

          {/* Card 3: Real-Time Global Markets (120+ Assets) */}
          <div className="launch-card rounded-3xl p-8 border border-white/[0.08] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                120+ Global Market Instruments
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect real-time market data across US Equities (NASDAQ/NYSE), Indian Markets (NSE/BSE), European Euronext/XETRA, Asian indices, Crypto, and Commodities.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {["US Equities", "NSE/BSE Demat", "Crypto Spot", "Futures & F&O", "Forex Majors", "Commodities"].map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-900 text-cyan-300 border border-white/[0.06]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Quantitative Strategy Studio (Col-span 2) */}
          <div className="md:col-span-2 launch-card rounded-3xl p-8 border border-white/[0.08] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                9+ Algorithmic Primitives &amp; Dynamic Visual Strategy Builder
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
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
                <div key={i} className="p-3 rounded-2xl bg-slate-950/60 border border-white/[0.04]">
                  <div className="text-xs font-bold text-white">{stg.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{stg.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
