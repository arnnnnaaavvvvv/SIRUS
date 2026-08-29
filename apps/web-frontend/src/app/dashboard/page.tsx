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
  Sliders,
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
    <div className="min-h-screen bg-[#0f1515] text-[#f4f4f5] flex flex-col selection:bg-[#fff800]/20 selection:text-white">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Top Header Row with quick action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                Quantitative Portfolio Terminal
              </h1>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#182222] text-[#fff800] border border-border">
                LIVE DMA
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-Tenant risk isolation across linked Alpaca &amp; KuCoin subaccounts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/strategies"
              className="px-4 py-2 rounded-md bg-[#182222] hover:bg-[#182222]/80 border border-border text-xs font-semibold text-foreground flex items-center space-x-2 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#fff800]" />
              <span>Strategy Studio</span>
            </Link>
            <Link
              href="/settings/api-keys"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-9 px-4 py-2 border border-white/10 hover:bg-white/20"
            >
              <Link2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Link Broker Demat</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Portfolio Value */}
          <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 border border-border relative overflow-hidden flex flex-col justify-between pricing-card-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Portfolio Capital
              </span>
              <div className="w-8 h-8 rounded-md bg-[#182222] border border-border flex items-center justify-center text-[#fff800]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">
                ${summary.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+1.39% Today</span>
            </div>
          </div>

          {/* Card 2: Unrealized P&L */}
          <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 border border-border flex flex-col justify-between pricing-card-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Unrealized Mark-to-Market
              </span>
              <div className="w-8 h-8 rounded-md bg-[#182222] border border-border flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-emerald-400 tracking-tight font-mono">
                +${summary.unrealized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground font-medium">Continuous Rebalancing</div>
          </div>

          {/* Card 3: Realized P&L */}
          <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 border border-border flex flex-col justify-between pricing-card-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Realized Net P&amp;L
              </span>
              <div className="w-8 h-8 rounded-md bg-[#182222] border border-border flex items-center justify-center text-cyan-400">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-cyan-400 tracking-tight font-mono">
                +${summary.realized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground font-medium">Closed Ledger Profit</div>
          </div>

          {/* Card 4: Active Positions */}
          <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 border border-border flex flex-col justify-between pricing-card-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Algorithmic Positions
              </span>
              <div className="w-8 h-8 rounded-md bg-[#182222] border border-border flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white tracking-tight font-mono">
                {summary.active_positions_count}
              </span>
            </div>
            <div className="mt-3 flex items-center space-x-1.5 text-xs text-[#fff800] font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Pre-Trade Risk Passing</span>
            </div>
          </div>
        </div>

        {/* Chart & Live Ticker Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Equity Curve */}
          <div className="lg:col-span-2 rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 sm:p-8 border border-border pricing-card-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-semibold text-white">Portfolio Equity Trajectory</h2>
                <p className="text-xs text-muted-foreground">Intraday session performance and continuous mark</p>
              </div>
              <span className="px-2.5 py-1 rounded-sm text-xs font-medium bg-[#182222] border border-border text-emerald-400 self-start sm:self-auto">
                +1.39% Session Return
              </span>
            </div>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEquityCurve}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fff800" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#fff800" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#414b4e" fontSize={11} tickLine={false} />
                  <YAxis domain={["dataMin - 500", "dataMax + 500"]} stroke="#414b4e" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#182222",
                      borderColor: "#272f30",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#797c7c" }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#fff800" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Market Ticker Stream */}
          <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] p-6 sm:p-8 border border-border flex flex-col justify-between space-y-4 pricing-card-border">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Live Market Feeds</h2>
                <span className="flex items-center space-x-1.5 text-[10px] text-[#fff800] font-bold uppercase bg-[#182222] px-2.5 py-1 rounded-sm border border-border font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#fff800] animate-ping" />
                  <span>WebSocket Feed</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(ticks).map(([sym, price]) => (
                  <div key={sym} className="flex items-center justify-between p-3 rounded-md bg-[#182222]/50 border border-border">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">{sym}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-mono bg-[#0f1515] text-muted-foreground border border-border">
                        {sym.includes("USDT") ? "KuCoin" : "Alpaca"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#182222] border border-border text-xs text-muted-foreground font-medium flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#fff800] flex-shrink-0" />
              <span>Ticks stream directly from venue sockets via Redis Pub/Sub.</span>
            </div>
          </div>
        </div>

        {/* Open Positions Table */}
        <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] border border-border overflow-hidden pricing-card-border">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Open Broker Positions</h2>
              <p className="text-xs text-muted-foreground">Isolated across Alpaca Equities &amp; KuCoin Crypto subaccounts</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground font-mono bg-[#182222] px-3 py-1 rounded-sm border border-border self-start sm:self-auto">
              {positions.length} Active Positions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#182222]/70 text-[11px] uppercase text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Symbol</th>
                  <th className="px-6 py-3.5">Broker Venue</th>
                  <th className="px-6 py-3.5">Position Side</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Avg Entry Price</th>
                  <th className="px-6 py-3.5">Current Price</th>
                  <th className="px-6 py-3.5">Unrealized P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {positions.map((pos, idx) => (
                  <tr key={idx} className="hover:bg-[#182222]/40 transition-colors font-mono">
                    <td className="px-6 py-4 font-bold text-white text-sm">{pos.symbol}</td>
                    <td className="px-6 py-4 uppercase text-muted-foreground font-semibold">{pos.broker_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                        {pos.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{pos.quantity}</td>
                    <td className="px-6 py-4 text-muted-foreground">${pos.avg_entry_price.toFixed(2)}</td>
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
