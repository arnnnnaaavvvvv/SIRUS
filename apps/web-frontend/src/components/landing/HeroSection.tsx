"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
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
    <section className="mx-auto max-w-7xl px-6 md:px-8 pt-16 pb-20 relative flex flex-col items-center justify-between">
      {/* Title & Subtitle */}
      <div className="text-center w-full max-w-4xl space-y-6">
        <h1 className="text-[44px] leading-[48px] md:text-[80px] md:leading-[82px] tracking-[-1.6px] font-medium text-white">
          Automated quantitative trading.<br />
          Built for systematic edge.
        </h1>

        <p className="mt-6 text-[18px] leading-[28px] md:text-[20px] md:leading-[32px] text-muted-foreground max-w-2xl mx-auto">
          Execute algorithmic strategies with direct market access across Equities, Crypto, and Futures. Vectorized backtesting and automated multi-tenant risk orchestration.
        </p>

        {/* CTA Buttons with Paddle secondary frosted style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-12 px-7 py-3 border border-white/10 hover:bg-white/20"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <Link
            href="/strategies"
            className="w-full sm:w-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer h-12 px-7 py-3 bg-[#182222] text-foreground hover:bg-[#182222]/80 border border-border transition-colors"
          >
            <Play className="w-4 h-4 mr-2 text-[#fff800] fill-[#fff800]/20" />
            <span>Explore Strategies</span>
          </Link>
        </div>
      </div>

      {/* Terminal Interactive Showcase with Paddle border */}
      <div className="mt-14 w-full max-w-5xl mx-auto">
        <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] border border-border p-1 md:p-2 overflow-hidden shadow-2xl relative">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#182222]/50 rounded-t-md">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-muted-foreground ml-2 font-medium">
                SIRUS Quant Terminal
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-[#0f1515] p-1 rounded-md border border-border text-xs">
              <button
                onClick={() => setActiveTab("chart")}
                className={`px-3 py-1 rounded-sm font-medium transition-all ${
                  activeTab === "chart"
                    ? "bg-[#182222] text-foreground border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Portfolio Trajectory
              </button>
              <button
                onClick={() => setActiveTab("execution")}
                className={`px-3 py-1 rounded-sm font-medium transition-all ${
                  activeTab === "execution"
                    ? "bg-[#182222] text-foreground border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Execution Stream
              </button>
              <button
                onClick={() => setActiveTab("risk")}
                className={`px-3 py-1 rounded-sm font-medium transition-all ${
                  activeTab === "risk"
                    ? "bg-[#182222] text-foreground border border-border shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Risk Engine
              </button>
            </div>

            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#fff800] animate-ping" />
              <span className="text-[11px] font-mono text-[#fff800] font-bold">DMA ACTIVE</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-5 sm:p-7 bg-[#0f1515]/90 rounded-b-md">
            {/* Stat Pill Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-md bg-[#182222]/70 border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Net Unrealized P&amp;L</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  +${livePnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-emerald-400/80 font-medium">+3.12% Intraday</span>
              </div>
              <div className="p-3.5 rounded-md bg-[#182222]/70 border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Live Fill Rate</span>
                <div className="text-xl font-bold font-mono text-[#fff800] mt-0.5">99.85%</div>
                <span className="text-[10px] text-[#fff800]/80 font-medium">Smart Order Routing</span>
              </div>
              <div className="p-3.5 rounded-md bg-[#182222]/70 border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Active Algorithmic Bots</span>
                <div className="text-xl font-bold font-mono text-white mt-0.5">4 Running</div>
                <span className="text-[10px] text-muted-foreground font-medium">Auto Rebalancing</span>
              </div>
              <div className="p-3.5 rounded-md bg-[#182222]/70 border border-border">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">Tick Ingestion</span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">42,500/s</div>
                <span className="text-[10px] text-cyan-400/80 font-medium">Zero Drop Redis PubSub</span>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "chart" && (
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHeroChart}>
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff800" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#fff800" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#414b4e" fontSize={11} tickLine={false} />
                    <YAxis domain={["dataMin - 200", "dataMax + 200"]} stroke="#414b4e" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#182222",
                        borderColor: "#272f30",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#fff800"
                      strokeWidth={2}
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
                  <div key={i} className="flex items-center justify-between p-3 rounded-md bg-[#182222]/50 border border-border text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-white">{row.sym}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {row.side}
                      </span>
                      <span className="text-muted-foreground">{row.qty} Units @ {row.price}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-muted-foreground uppercase">{row.broker}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {row.status}
                      </span>
                      <span className="text-muted-foreground">{row.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "risk" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                <div className="p-4 rounded-md bg-[#182222]/50 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold">Max Drawdown Guard</span>
                    <span className="text-emerald-400 font-mono font-bold">Active (3.5%)</span>
                  </div>
                  <div className="w-full bg-[#0f1515] rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full w-[24%]" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Current DD: 0.84% (Safe threshold)</p>
                </div>
                <div className="p-4 rounded-md bg-[#182222]/50 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold">Pre-Trade Margin Check</span>
                    <span className="text-[#fff800] font-mono font-bold">100% Passed</span>
                  </div>
                  <div className="w-full bg-[#0f1515] rounded-full h-2">
                    <div className="bg-[#fff800] h-2 rounded-full w-[100%]" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Isolated per-broker subaccounts</p>
                </div>
                <div className="p-4 rounded-md bg-[#182222]/50 border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold">Automated Stop-Loss Limits</span>
                    <span className="text-cyan-400 font-mono font-bold">Dynamic ATR</span>
                  </div>
                  <div className="w-full bg-[#0f1515] rounded-full h-2">
                    <div className="bg-cyan-400 h-2 rounded-full w-[80%]" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Real-time trailing stop execution</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
