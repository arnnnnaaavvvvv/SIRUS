"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Download, Filter, Search, CheckCircle, Clock, XCircle } from "lucide-react";

interface Order {
  id: string;
  client_order_id: string;
  broker_name: string;
  symbol: string;
  side: string;
  order_type: string;
  quantity: number;
  avg_fill_price: number;
  status: string;
  created_at: string;
}

export default function TradesPage() {
  const { fetchWithAuth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ord_101",
      client_order_id: "ord_usr123_stg456_001",
      broker_name: "alpaca",
      symbol: "AAPL",
      side: "buy",
      order_type: "limit",
      quantity: 50,
      avg_fill_price: 175.5,
      status: "filled",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ord_102",
      client_order_id: "ord_usr123_stg456_002",
      broker_name: "kucoin",
      symbol: "BTC-USDT",
      side: "buy",
      order_type: "market",
      quantity: 0.25,
      avg_fill_price: 62100.0,
      status: "filled",
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchWithAuth("/api/v1/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setOrders(data);
      })
      .catch(() => {});
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchSym = o.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    const matchStat = filterStatus === "all" || o.status === filterStatus;
    return matchSym && matchStat;
  });

  const exportCSV = () => {
    const headers = "ClientOrderID,Broker,Symbol,Side,Type,Quantity,AvgPrice,Status,CreatedAt\n";
    const rows = filteredOrders
      .map(
        (o) =>
          `${o.client_order_id},${o.broker_name},${o.symbol},${o.side},${o.order_type},${o.quantity},${o.avg_fill_price},${o.status},${o.created_at}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sirus_trade_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#090D16]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Execution & Audit History</h1>
            <p className="text-xs text-gray-400">Reconciled trade ledger across Alpaca and KuCoin brokers</p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV Audit</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="glass-card rounded-2xl p-4 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search symbol (e.g. BTC-USDT)"
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-xs text-white"
            >
              <option value="all">All Order Statuses</option>
              <option value="filled">Filled Only</option>
              <option value="submitted">Submitted Only</option>
              <option value="canceled">Canceled Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/80 text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Client Order ID</th>
                  <th className="px-6 py-4">Broker</th>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Side</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Avg Fill Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-800/40 transition-colors font-mono text-xs">
                    <td className="px-6 py-4 text-gray-400">{new Date(ord.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-300 font-bold">{ord.client_order_id}</td>
                    <td className="px-6 py-4 uppercase text-gray-400">{ord.broker_name}</td>
                    <td className="px-6 py-4 font-bold text-white">{ord.symbol}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          ord.side === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {ord.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-200">{ord.quantity}</td>
                    <td className="px-6 py-4 text-white font-bold">${ord.avg_fill_price ? ord.avg_fill_price.toFixed(2) : "-"}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="capitalize">{ord.status}</span>
                      </span>
                    </td>
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
