"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Play,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  BarChart3,
  Lock,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const mockHeroChart = [
  { time: "09:30", pnl: 0, equity: 100000 },
  { time: "10:00", pnl: 450, equity: 100450 },
  { time: "10:30", pnl: 320, equity: 100320 },
  { time: "11:00", pnl: 890, equity: 100890 },
  { time: "11:30", pnl: 1200, equity: 101200 },
  { time: "12:00", pnl: 1050, equity: 101050 },
  { time: "12:30", pnl: 1650, equity: 101650 },
  { time: "13:00", pnl: 2100, equity: 102100 },
  { time: "13:30", pnl: 2480, equity: 102480 },
  { time: "14:00", pnl: 3120, equity: 103120 },
];

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState<"chart" | "execution" | "risk">("chart");
  const [livePnl, setLivePnl] = useState(3120.45);

  useEffect(() => {
    const timer = setInterval(() => {
      setLivePnl((prev) => +(prev + (Math.random() - 0.45) * 8.5).toFixed(2));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background Radiant Glows */}
      <div className="hero-glow-cyan top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="hero-glow-purple top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Announcement Badge */}
        <div className="flex justify-center mb-8">
          <Link
            href="/strategies"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-glow-cyan text-xs font-semibold text-cyan-300 hover:text-white transition-all hover:scale-[1.02]"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="bg-gradient-to-r from-cyan-300 via-white to-blue-300 bg-clip-text text-transparent">
              SIRUS v2.4 Engine Live: Multi-broker DMA & Vectorized Backtesting
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-white">The Automated Quantitative</span>{" "}
            <span className="text-gradient-cyan">Trading Engine</span>{" "}
            <span className="text-white">Built for Edge.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
            Execute algorithmic strategies with direct market access across Equities, Crypto, and Futures. Sub-100ms vectorized backtesting, bank-grade encryption, and automated multi-tenant risk orchestration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 ring-1 ring-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/strategies"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl launch-card hover:bg-slate-900/80 border border-white/10 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span>Explore Strategies</span>
            </Link>
          </div>

          {/* Trust Metrics & Social Proof */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Isolated Demat Keys (AES-256)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>&lt; 5ms Venue Execution</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>GPU Vectorized Backtesting</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="launch-card-static rounded-3xl p-1 md:p-2 border border-white/10 shadow-2xl relative">
            {/* Top Terminal Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-slate-950/60 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2 font-medium">
                  sirus-terminal // live-dma-session
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-white/[0.06] text-xs">
                <button
                  onClick={() => setActiveTab("chart")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "chart"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Portfolio Trajectory
                </button>
                <button
                  onClick={() => setActiveTab("execution")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "execution"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Execution Stream
                </button>
                <button
                  onClick={() => setActiveTab("risk")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "risk"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Risk Engine
                </button>
              </div>

              <div className="hidden sm:flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono text-emerald-400 font-bold">DMA ACTIVE</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 sm:p-6 bg-slate-950/70 rounded-b-2xl">
              {/* Quick Stat Pill Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Unrealized P&L</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    +${livePnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-medium">+3.12% Intraday</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Fill Rate</span>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">99.85%</div>
                  <span className="text-[10px] text-cyan-400/80 font-medium">Smart Order Routing</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Algorithmic Bots</span>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">4 Running</div>
                  <span className="text-[10px] text-slate-400 font-medium">Auto Rebalancing</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tick Ingestion</span>
                  <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">42,500/s</div>
                  <span className="text-[10px] text-purple-400/80 font-medium">Zero Drop Redis PubSub</span>
                </div>
              </div>

              {/* Dynamic Tab Content */}
              {activeTab === "chart" && (
                <div className="h-64 sm:h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockHeroChart}>
                      <defs>
                        <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis domain={["dataMin - 200", "dataMax + 200"]} stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0a0f1e",
                          borderColor: "#1e293b",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="equity"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#heroGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeTab === "execution" && (
                <div className="space-y-2 py-2">
                  {[
                    { sym: "BTC-USDT", side: "BUY", qty: "0.25", price: "$64,850.00", broker: "KuCoin", status: "Filled", time: "14:02:11" },
                    { sym: "AAPL", side: "BUY", qty: "50", price: "$182.30", broker: "Alpaca", status: "Filled", time: "14:00:45" },
                    { sym: "RELIANCE", side: "BUY", qty: "30", price: "₹2,887.45", broker: "Zerodha", status: "Filled", time: "13:58:20" },
                    { sym: "NVDA", side: "BUY", qty: "40", price: "$131.38", broker: "Alpaca", status: "Filled", time: "13:55:02" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] text-xs font-mono">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white">{row.sym}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                          {row.side}
                        </span>
                        <span className="text-slate-400">{row.qty} Units @ {row.price}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 uppercase">{row.broker}</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {row.status}
                        </span>
                        <span className="text-slate-500">{row.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "risk" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Max Drawdown Guard</span>
                      <span className="text-emerald-400 font-mono font-bold">Active (3.5%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full w-[24%]" />
                    </div>
                    <p className="text-[10px] text-slate-400">Current DD: 0.84% (Safe threshold)</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Pre-Trade Margin Check</span>
                      <span className="text-cyan-400 font-mono font-bold">100% Passed</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-cyan-400 h-2 rounded-full w-[100%]" />
                    </div>
                    <p className="text-[10px] text-slate-400">Isolated per-broker subaccounts</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Automated Stop-Loss Limits</span>
                      <span className="text-purple-400 font-mono font-bold">Dynamic ATR</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-purple-400 h-2 rounded-full w-[80%]" />
                    </div>
                    <p className="text-[10px] text-slate-400">Real-time trailing stop execution</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
