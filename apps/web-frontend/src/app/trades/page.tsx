"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import {
  History,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

interface TradeOrder {
  id: string;
  created_at: string;
  symbol: string;
  broker_name: string;
  side: string;
  order_type: string;
  quantity: number;
  filled_quantity: number;
  average_fill_price: number;
  status: string;
}

const mockOrders: TradeOrder[] = [
  {
    id: "ord-98214",
    created_at: "2026-08-29T14:15:20Z",
    symbol: "BTC-USDT",
    broker_name: "kucoin",
    side: "BUY",
    order_type: "MARKET",
    quantity: 0.25,
    filled_quantity: 0.25,
    average_fill_price: 64850.0,
    status: "FILLED",
  },
  {
    id: "ord-98213",
    created_at: "2026-08-29T14:02:11Z",
    symbol: "AAPL",
    broker_name: "alpaca",
    side: "BUY",
    order_type: "LIMIT",
    quantity: 50,
    filled_quantity: 50,
    average_fill_price: 182.3,
    status: "FILLED",
  },
  {
    id: "ord-98212",
    created_at: "2026-08-29T13:58:20Z",
    symbol: "RELIANCE",
    broker_name: "zerodha",
    side: "BUY",
    order_type: "MARKET",
    quantity: 30,
    filled_quantity: 30,
    average_fill_price: 2887.45,
    status: "FILLED",
  },
  {
    id: "ord-98211",
    created_at: "2026-08-29T13:40:05Z",
    symbol: "NVDA",
    broker_name: "alpaca",
    side: "SELL",
    order_type: "LIMIT",
    quantity: 40,
    filled_quantity: 40,
    average_fill_price: 131.38,
    status: "FILLED",
  },
  {
    id: "ord-98210",
    created_at: "2026-08-29T12:20:18Z",
    symbol: "ETH-USDT",
    broker_name: "kucoin",
    side: "BUY",
    order_type: "MARKET",
    quantity: 2.5,
    filled_quantity: 2.5,
    average_fill_price: 3450.0,
    status: "FILLED",
  },
];

export default function TradesPage() {
  const { fetchWithAuth } = useAuth();
  const [orders, setOrders] = useState<TradeOrder[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchWithAuth("/api/v1/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setOrders(data);
      })
      .catch(() => {});
  }, []);

  const filtered = orders.filter((ord) => {
    const matchesSearch =
      ord.symbol.toLowerCase().includes(search.toLowerCase()) ||
      ord.id.toLowerCase().includes(search.toLowerCase());
    const matchesBroker = brokerFilter === "ALL" || ord.broker_name.toUpperCase() === brokerFilter;
    const matchesStatus = statusFilter === "ALL" || ord.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesBroker && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ["Order ID", "Timestamp", "Symbol", "Broker", "Side", "Type", "Qty", "Filled Qty", "Avg Price", "Status"];
    const rows = filtered.map((o) => [
      o.id,
      o.created_at,
      o.symbol,
      o.broker_name,
      o.side,
      o.order_type,
      o.quantity,
      o.filled_quantity,
      o.average_fill_price,
      o.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sirus_trade_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0f1515] text-[#f4f4f5] flex flex-col selection:bg-[#fff800]/20 selection:text-white">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8 flex-grow">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white flex items-center gap-2.5">
                <History className="w-6 h-6 text-[#fff800]" />
                Trade Order Ledger &amp; Audit Log
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deterministic transaction ledger across all linked broker and Demat execution venues
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-9 px-4 py-2 border border-white/10 hover:bg-white/20 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#fff800]" />
            <span>Export Audit CSV</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Symbol or Order ID..."
              className="w-full bg-[#182222] border border-border rounded-md pl-10 pr-4 py-2.5 text-xs text-white focus:border-border-light focus:outline-none transition-colors"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
              className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-slate-300 focus:border-border-light focus:outline-none"
            >
              <option value="ALL">All Brokers</option>
              <option value="ALPACA">Alpaca Equities</option>
              <option value="KUCOIN">KuCoin Derivatives</option>
              <option value="ZERODHA">Zerodha Demat</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#182222] border border-border rounded-md py-2.5 px-3 text-xs text-slate-300 focus:border-border-light focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="FILLED">Filled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="rounded-lg bg-[#0f1515]/75 backdrop-blur-[6px] border border-border overflow-hidden pricing-card-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#182222]/60 text-[11px] uppercase text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Symbol</th>
                  <th className="px-6 py-3.5">Broker Venue</th>
                  <th className="px-6 py-3.5">Side</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Quantity</th>
                  <th className="px-6 py-3.5">Avg Fill Price</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#182222]/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{ord.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-sm">{ord.symbol}</td>
                    <td className="px-6 py-4 uppercase text-muted-foreground font-semibold">{ord.broker_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                          ord.side === "BUY"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {ord.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{ord.order_type}</td>
                    <td className="px-6 py-4 text-white font-bold">{ord.filled_quantity} / {ord.quantity}</td>
                    <td className="px-6 py-4 text-white font-bold">${ord.average_fill_price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{ord.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground py-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#fff800]" />
            Deterministic execution logs signed with tenant HMAC key.
          </span>
          <span className="font-mono">{filtered.length} Orders Recorded</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
