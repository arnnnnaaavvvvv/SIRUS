"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Layers,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Globe2,
  Sliders,
  Plus,
  Link2,
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
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Row with quick action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Quantitative Portfolio Terminal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                LIVE DMA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-Tenant risk isolation across linked Alpaca &amp; KuCoin accounts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/strategies"
              className="px-4 py-2.5 rounded-xl launch-card hover:bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 flex items-center space-x-2"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Strategy Studio</span>
            </Link>
            <Link
              href="/settings/api-keys"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 ring-1 ring-white/20"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link Broker Demat</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Portfolio Value */}
          <div className="launch-card rounded-3xl p-6 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Portfolio Capital
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                ${summary.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+1.39% Today</span>
            </div>
          </div>

          {/* Card 2: Unrealized P&L */}
          <div className="launch-card rounded-3xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Unrealized Mark-to-Market
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-emerald-400 tracking-tight font-mono">
                +${summary.unrealized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400 font-medium">Continuous Rebalancing</div>
          </div>

          {/* Card 3: Realized P&L */}
          <div className="launch-card rounded-3xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Realized Net P&L
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-cyan-400 tracking-tight font-mono">
                +${summary.realized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400 font-medium">Closed Ledger Profit</div>
          </div>

          {/* Card 4: Active Positions */}
          <div className="launch-card rounded-3xl p-6 border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Algorithmic Positions
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {summary.active_positions_count}
              </span>
            </div>
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-purple-400 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Pre-Trade Risk Passing</span>
            </div>
          </div>
        </div>

        {/* Chart & Live Ticker Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Equity Curve */}
          <div className="lg:col-span-2 launch-card rounded-3xl p-6 sm:p-8 border border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Portfolio Equity Trajectory</h2>
                <p className="text-xs text-slate-400">Intraday session performance and continuous mark</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 self-start sm:self-auto">
                +1.39% Session Return
              </span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEquityCurve}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis domain={["dataMin - 500", "dataMax + 500"]} stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0f1e",
                      borderColor: "#1e293b",
                      borderRadius: "14px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Market Ticker Stream */}
          <div className="launch-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Live Market Feeds</h2>
                <span className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>WebSocket Feed</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(ticks).map(([sym, price]) => (
                  <div key={sym} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-white/[0.04]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">{sym}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-900 text-slate-400 border border-white/[0.04]">
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

            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-medium flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Ticks stream directly from venue sockets via Redis Pub/Sub.</span>
            </div>
          </div>
        </div>

        {/* Open Positions Table */}
        <div className="launch-card rounded-3xl border border-white/[0.08] overflow-hidden">
          <div className="p-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white">Open Broker Positions</h2>
              <p className="text-xs text-slate-400">Isolated across Alpaca Equities &amp; KuCoin Crypto subaccounts</p>
            </div>
            <span className="text-xs font-bold text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-full border border-white/[0.08] self-start sm:self-auto">
              {positions.length} Active Positions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400 font-bold border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Broker Venue</th>
                  <th className="px-6 py-4">Position Side</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Avg Entry Price</th>
                  <th className="px-6 py-4">Current Price</th>
                  <th className="px-6 py-4">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {positions.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors font-mono">
                    <td className="px-6 py-4 font-bold text-white text-sm">{pos.symbol}</td>
                    <td className="px-6 py-4 uppercase text-slate-400 font-semibold">{pos.broker_name}</td>
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

      <Footer />
    </div>
  );
}
