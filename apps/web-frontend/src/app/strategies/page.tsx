"use client";

import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  Sliders,
  Play,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const STRATEGY_PRESETS = [
  { id: "MA_CROSSOVER", name: "Moving Average Crossover", desc: "Dual EMA trend-following filter (Fast 9 / Slow 21)" },
  { id: "RSI_REVERSION", name: "RSI Mean Reversion", desc: "Overbought 70 / Oversold 30 oscillation bounds (14 bars)" },
  { id: "DONCHIAN_BREAKOUT", name: "Donchian Channel Breakout", desc: "Multi-day upper channel breakthrough momentum (20 bars)" },
  { id: "BOLLINGER_REVERSAL", name: "Bollinger Band Reversal", desc: "2.0 Standard deviation mean reversion with volume confirm" },
  { id: "VWAP_INSTITUTIONAL", name: "Institutional VWAP Cross", desc: "Intraday volume-weighted average price benchmark" },
];

export default function StrategiesPage() {
  const [selectedStrategy, setSelectedStrategy] = useState("MA_CROSSOVER");
  const [symbol, setSymbol] = useState("BTC-USDT");
  const [timeframe, setTimeframe] = useState("5m");
  const [capital, setCapital] = useState("25000");
  const [stopLoss, setStopLoss] = useState("1.5");
  const [takeProfit, setTakeProfit] = useState("3.0");
  const [running, setRunning] = useState(false);
  const [backtestRan, setBacktestRan] = useState(true);

  const [metrics, setMetrics] = useState({
    winRate: 68.4,
    totalReturn: 24.8,
    maxDrawdown: 3.2,
    sharpe: 2.34,
    profitFactor: 2.15,
    trades: 142,
  });

  const chartData = [
    { trade: "T1", equity: 25000 },
    { trade: "T20", equity: 26200 },
    { trade: "T40", equity: 25800 },
    { trade: "T60", equity: 27900 },
    { trade: "T80", equity: 28400 },
    { trade: "T100", equity: 29800 },
    { trade: "T120", equity: 30400 },
    { trade: "T140", equity: 31200 },
  ];

  const handleRunBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setBacktestRan(true);
      setMetrics({
        winRate: +(60 + Math.random() * 15).toFixed(1),
        totalReturn: +(15 + Math.random() * 20).toFixed(1),
        maxDrawdown: +(2 + Math.random() * 3).toFixed(1),
        sharpe: +(1.8 + Math.random() * 1.0).toFixed(2),
        profitFactor: +(1.7 + Math.random() * 0.8).toFixed(2),
        trades: Math.floor(100 + Math.random() * 80),
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0f1515] text-[#f4f4f5] flex flex-col selection:bg-[#fff800]/20 selection:text-white">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8 flex-grow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-2.5">
                <Sliders className="w-6 h-6 text-[#fff800]" />
                Algorithmic Strategy Studio
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Vectorized backtesting engine with pre-trade risk parameter enforcement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-sm text-xs font-mono font-bold bg-[#182222] text-[#fff800] border border-border">
              Vectorized C++ Engine: Sub-100ms
            </span>
          </div>
        </div>

        {/* Strategy Presets Selector */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STRATEGY_PRESETS.map((stg) => {
            const active = selectedStrategy === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStrategy(stg.id)}
                className={`p-4 rounded-lg text-left transition-all border flex flex-col justify-between space-y-2 ${
                  active
                    ? "bg-[#182222] border-border/90 shadow-xs"
                    : "bg-[#0f1515]/75 border-border hover:border-border-light"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${active ? "text-[#fff800]" : "text-white"}`}>
                    {stg.name}
                  </span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#fff800]" />}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {stg.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Strategy Configuration & Backtest Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Parameters */}
          <div className="lg:col-span-5 rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 sm:p-7 border border-border space-y-5 pricing-card-border">
            <h2 className="text-base font-semibold text-white">Strategy Parameters</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Asset Instrument</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-white focus:border-border-light focus:outline-none"
                >
                  <option value="BTC-USDT">BTC-USDT (KuCoin Futures)</option>
                  <option value="ETH-USDT">ETH-USDT (KuCoin Futures)</option>
                  <option value="AAPL">AAPL (Alpaca Equities)</option>
                  <option value="NVDA">NVDA (Alpaca Equities)</option>
                  <option value="RELIANCE">RELIANCE (Zerodha Kite Demat)</option>
                  <option value="HDFCBANK">HDFCBANK (Zerodha Kite Demat)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-white focus:border-border-light focus:outline-none"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="1d">1 Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Initial Capital ($)</label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-white focus:border-border-light focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Stop Loss Limit (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-white focus:border-border-light focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Take Profit Target (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-white focus:border-border-light focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunBacktest}
                disabled={running}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-11 px-5 py-[10px] w-full border border-white/10 hover:bg-white/20"
              >
                <Play className="w-4 h-4 mr-2 text-[#fff800] fill-[#fff800]" />
                <span>{running ? "Simulating Vectorized Engine..." : "Run Vectorized Backtest"}</span>
              </button>
            </div>

            <div className="p-3 rounded-md bg-[#182222] border border-border text-[11px] text-muted-foreground flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#fff800] flex-shrink-0" />
              <span>Pre-trade risk validator checks position limits and drawdown bounds automatically.</span>
            </div>
          </div>

          {/* Right Area: Backtest Results */}
          <div className="lg:col-span-7 space-y-6">
            {/* Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-4 border border-border pricing-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Net Return</span>
                <div className="text-xl font-bold font-mono text-[#fff800] mt-1">+{metrics.totalReturn}%</div>
              </div>
              <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-4 border border-border pricing-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Win Rate</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{metrics.winRate}%</div>
              </div>
              <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-4 border border-border pricing-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Max Drawdown</span>
                <div className="text-xl font-bold font-mono text-rose-400 mt-1">-{metrics.maxDrawdown}%</div>
              </div>
              <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-4 border border-border pricing-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Sharpe Ratio</span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{metrics.sharpe}</div>
              </div>
              <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-4 border border-border pricing-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Profit Factor</span>
                <div className="text-xl font-bold font-mono text-white mt-1">{metrics.profitFactor}</div>
              </div>
              <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-4 border border-border pricing-card-border">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Simulated Trades</span>
                <div className="text-xl font-bold font-mono text-white mt-1">{metrics.trades}</div>
              </div>
            </div>

            {/* Backtest Equity Curve Chart */}
            <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 border border-border pricing-card-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Simulated Cumulative Equity</h3>
                <span className="text-[10px] font-mono text-[#fff800] bg-[#182222] px-2 py-0.5 rounded-sm border border-border">
                  140 Trades Sampled
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="stgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff800" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#fff800" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="trade" stroke="#414b4e" fontSize={11} tickLine={false} />
                    <YAxis domain={["dataMin - 1000", "dataMax + 1000"]} stroke="#414b4e" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#182222",
                        borderColor: "#272f30",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "#fff",
                      }}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#fff800" strokeWidth={2} fill="url(#stgGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
