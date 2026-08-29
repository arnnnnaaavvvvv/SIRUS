"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function LiveSimulator() {
  const [strategy, setStrategy] = useState("MA_CROSSOVER");
  const [fastPeriod, setFastPeriod] = useState(9);
  const [slowPeriod, setSlowPeriod] = useState(21);
  const [stopLoss, setStopLoss] = useState(2.0);

  // Dynamically calculate simulated metrics and equity curve based on slider changes
  const { metrics, chartData } = useMemo(() => {
    const seed = fastPeriod * 3 + slowPeriod * 2 + stopLoss * 10;
    const winRate = +(62 + (seed % 14)).toFixed(1);
    const totalReturn = +(12.4 + (seed % 18) * 0.8).toFixed(1);
    const maxDrawdown = +(2.8 + (seed % 5) * 0.4).toFixed(1);
    const sharpe = +(1.85 + (seed % 10) * 0.08).toFixed(2);

    const points = [
      { day: "D1", equity: 10000 },
      { day: "D2", equity: +(10000 + totalReturn * 45).toFixed(0) },
      { day: "D3", equity: +(10000 + totalReturn * 30).toFixed(0) },
      { day: "D4", equity: +(10000 + totalReturn * 75).toFixed(0) },
      { day: "D5", equity: +(10000 + totalReturn * 60).toFixed(0) },
      { day: "D6", equity: +(10000 + totalReturn * 95).toFixed(0) },
      { day: "D7", equity: +(10000 + totalReturn * 100).toFixed(0) },
    ];

    return {
      metrics: { winRate, totalReturn, maxDrawdown, sharpe },
      chartData: points,
    };
  }, [strategy, fastPeriod, slowPeriod, stopLoss]);

  return (
    <section className="py-20 relative overflow-hidden bg-[#0f1515]/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-[32px] leading-[36px] md:text-[52px] md:leading-[56px] tracking-[-1.6px] font-medium text-white">
            Test algorithmic parameters in real time.
          </h2>
          <p className="text-[16px] text-muted-foreground">
            Adjust indicators below to see instant vectorized backtest simulations and equity trajectories.
          </p>
        </div>

        {/* Simulator Card Container */}
        <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 sm:p-10 border border-border max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pricing-card-border">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Strategy Model</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-white font-medium focus:border-border-light focus:outline-none"
              >
                <option value="MA_CROSSOVER">Dual Moving Average Crossover</option>
                <option value="RSI_MEAN_REVERSION">RSI Mean Reversion (14)</option>
                <option value="DONCHIAN_BREAKOUT">Donchian 20-Day Breakout</option>
                <option value="VWAP_CROSS">Institutional VWAP Anchor</option>
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Fast Period Window</span>
                  <span className="font-mono text-[#fff800] font-bold">{fastPeriod} Bars</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#182222] rounded-lg appearance-none cursor-pointer accent-[#fff800]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Slow Period Window</span>
                  <span className="font-mono text-[#fff800] font-bold">{slowPeriod} Bars</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#182222] rounded-lg appearance-none cursor-pointer accent-[#fff800]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Pre-Trade Stop Loss Guard</span>
                  <span className="font-mono text-rose-400 font-bold">{stopLoss}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#182222] rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/strategies"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-11 px-5 py-[10px] w-full border border-white/10 hover:bg-white/20"
              >
                <span>Deploy Strategy to Live Sandbox</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-md bg-[#182222]/60 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Win Rate</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{metrics.winRate}%</span>
              </div>
              <div className="p-3.5 rounded-md bg-[#182222]/60 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Sim Return</span>
                <span className="text-lg font-bold font-mono text-[#fff800]">+{metrics.totalReturn}%</span>
              </div>
              <div className="p-3.5 rounded-md bg-[#182222]/60 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Max Drawdown</span>
                <span className="text-lg font-bold font-mono text-rose-400">-{metrics.maxDrawdown}%</span>
              </div>
              <div className="p-3.5 rounded-md bg-[#182222]/60 border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">Sharpe Ratio</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{metrics.sharpe}</span>
              </div>
            </div>

            {/* Simulation Chart */}
            <div className="p-4 rounded-md bg-[#182222]/60 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Simulated Equity Trajectory</span>
                <span className="text-[10px] font-mono text-[#fff800] bg-[#fff800]/10 px-2 py-0.5 rounded-full border border-[#fff800]/20">
                  Initial Capital: $10,000
                </span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff800" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fff800" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#414b4e" fontSize={10} tickLine={false} />
                    <YAxis domain={["dataMin - 100", "dataMax + 100"]} stroke="#414b4e" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#182222",
                        borderColor: "#272f30",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#fff800" strokeWidth={2} fill="url(#simGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
