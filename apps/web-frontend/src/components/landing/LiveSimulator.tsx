"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sliders, Play, ArrowRight, Activity, Zap, Award, Layers } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export default function LiveSimulator() {
  const [strategy, setStrategy] = useState("MA_CROSSOVER");
  const [fastPeriod, setFastPeriod] = useState(9);
  const [slowPeriod, setSlowPeriod] = useState(21);
  const [stopLoss, setStopLoss] = useState(2.0);

  // Dynamically calculate simulated metrics and equity curve based on slider changes
  const { metrics, chartData } = useMemo(() => {
    const seed = (fastPeriod * 3 + slowPeriod * 2 + stopLoss * 10);
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
    <section className="py-20 relative overflow-hidden bg-slate-950/40 border-y border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Test Algorithmic Parameters <span className="text-gradient-cyan">In Real Time</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Adjust indicators below to see instant vectorized backtest simulations and equity trajectories.
          </p>
        </div>

        {/* Simulator Card Container */}
        <div className="launch-card rounded-3xl p-6 sm:p-10 border border-white/10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Strategy Model</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-medium focus:border-cyan-500 focus:outline-none"
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
                  <span className="font-mono text-cyan-400 font-bold">{fastPeriod} Bars</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Slow Period Window</span>
                  <span className="font-mono text-cyan-400 font-bold">{slowPeriod} Bars</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/strategies"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2"
              >
                <span>Deploy Strategy to Live Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block font-medium">Win Rate</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{metrics.winRate}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block font-medium">Sim Return</span>
                <span className="text-lg font-bold font-mono text-cyan-400">+{metrics.totalReturn}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block font-medium">Max Drawdown</span>
                <span className="text-lg font-bold font-mono text-rose-400">-{metrics.maxDrawdown}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block font-medium">Sharpe Ratio</span>
                <span className="text-lg font-bold font-mono text-purple-400">{metrics.sharpe}</span>
              </div>
            </div>

            {/* Simulation Chart */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Simulated Equity Trajectory</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Initial Capital: $10,000
                </span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis domain={["dataMin - 100", "dataMax + 100"]} stroke="#475569" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0f1e",
                        borderColor: "#1e293b",
                        borderRadius: "10px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={2} fill="url(#simGrad)" />
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
