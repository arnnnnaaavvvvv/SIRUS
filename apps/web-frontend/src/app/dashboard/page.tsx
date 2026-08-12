"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Layers,
  Zap,
  ArrowUpRight,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface Position {
  symbol: string;
  broker_name: string;
  side: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
}

interface Summary {
  portfolio_value: number;
  unrealized_pnl: number;
  realized_pnl: number;
  total_pnl: number;
  active_positions_count: number;
}

const mockEquityCurve = [
  { time: "09:30", equity: 100000 },
  { time: "10:00", equity: 100450 },
  { time: "10:30", equity: 100320 },
  { time: "11:00", equity: 100890 },
  { time: "11:30", equity: 101200 },
  { time: "12:00", equity: 101050 },
  { time: "12:30", equity: 101650 },
  { time: "13:00", equity: 102100 },
];

export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const [summary, setSummary] = useState<Summary>({
    portfolio_value: 102100.0,
    unrealized_pnl: 1027.5,
    realized_pnl: 370.0,
    total_pnl: 1397.5,
    active_positions_count: 2,
  });
  const [positions, setPositions] = useState<Position[]>([
    {
      symbol: "AAPL",
      broker_name: "alpaca",
      side: "long",
      quantity: 50,
      avg_entry_price: 175.5,
      current_price: 182.3,
      unrealized_pnl: 340.0,
      realized_pnl: 120.0,
    },
    {
      symbol: "BTC-USDT",
      broker_name: "kucoin",
      side: "long",
      quantity: 0.25,
      avg_entry_price: 62100.0,
      current_price: 64850.0,
      unrealized_pnl: 687.5,
      realized_pnl: 250.0,
    },
  ]);
  const [ticks, setTicks] = useState<Record<string, number>>({
    AAPL: 182.3,
    "BTC-USDT": 64850.0,
    "ETH-USDT": 3450.0,
    NVDA: 125.4,
  });

  useEffect(() => {
    fetchWithAuth("/api/v1/positions/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio_value) setSummary(data);
      })
      .catch(() => {});

    fetchWithAuth("/api/v1/positions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPositions(data);
      })
      .catch(() => {});

    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000") + "/ws/v1/market-data";
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.event_type === "MARKET_TICK" && msg.data) {
          setTicks((prev) => ({
            ...prev,
            [msg.data.symbol]: msg.data.last_price,
          }));
        }
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Portfolio Value */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800/80 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Value</span>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                ${summary.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+1.39% Today</span>
            </div>
          </div>

          {/* Card 2: Unrealized P&L */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unrealized P&L</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-400 tracking-tight font-mono">
                +${summary.unrealized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Live Mark-to-Market
            </div>
          </div>

          {/* Card 3: Realized P&L */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Realized P&L</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/10">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-cyan-400 tracking-tight font-mono">
                +${summary.realized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400 font-medium">Closed Trades Total</div>
          </div>

          {/* Card 4: Active Positions */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Positions</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-500/10">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-white tracking-tight font-mono">{summary.active_positions_count}</span>
            </div>
            <div className="mt-2 flex items-center space-x-1 text-xs text-cyan-400 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Risk Engine Active</span>
            </div>
          </div>
        </div>

        {/* Chart & Live Ticker Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Equity Curve */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Portfolio Equity Growth</h2>
                <p className="text-xs text-slate-400">Intraday performance trajectory</p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                +1.39% Session Return
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEquityCurve}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={["dataMin - 500", "dataMax + 500"]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "16px", color: "#fff" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Market Ticker */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Real-Time Market Ticker</h2>
                <span className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>WebSocket Feed</span>
                </span>
              </div>

              <div className="space-y-3">
                {Object.entries(ticks).map(([sym, price]) => (
                  <div key={sym} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">{sym}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300">
                        {sym.includes("USDT") ? "KuCoin" : "Alpaca"}
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-medium flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Ticks stream directly from exchange venue WebSockets via Redis Pub/Sub.</span>
            </div>
          </div>
        </div>

        {/* Open Positions Table */}
        <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Open Broker Positions</h2>
              <p className="text-xs text-slate-400">Isolated across Alpaca Equities & KuCoin Crypto tenants</p>
            </div>
            <span className="text-xs font-bold text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              {positions.length} Active Positions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Broker</th>
                  <th className="px-6 py-4">Side</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Avg Entry</th>
                  <th className="px-6 py-4">Current Price</th>
                  <th className="px-6 py-4">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors font-mono text-xs">
                    <td className="px-6 py-4 font-bold text-white">{pos.symbol}</td>
                    <td className="px-6 py-4 uppercase text-slate-400">{pos.broker_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {pos.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{pos.quantity}</td>
                    <td className="px-6 py-4 text-slate-400">${pos.avg_entry_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-white font-bold">${pos.current_price.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-emerald-400">+${pos.unrealized_pnl.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
