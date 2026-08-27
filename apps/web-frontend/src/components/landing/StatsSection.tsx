"use client";

import React from "react";
import { TrendingUp, Zap, Clock, ShieldCheck, BarChart3, Globe } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      label: "Total Volume Executed",
      value: "$4.8B+",
      change: "+48% YoY",
      desc: "Routed across Equities & Crypto liquidity venues",
      icon: BarChart3,
      color: "text-cyan-400",
    },
    {
      label: "Average Execution Latency",
      value: "< 4.2ms",
      change: "Sub-millisecond",
      desc: "Optimized DMA socket buffers and Redis pub/sub",
      icon: Zap,
      color: "text-emerald-400",
    },
    {
      label: "Historical Core Uptime",
      value: "99.99%",
      change: "Fault-Tolerant",
      desc: "Multi-region redundant failover microservices",
      icon: ShieldCheck,
      color: "text-blue-400",
    },
    {
      label: "Global Market Instruments",
      value: "120+",
      change: "6 Asset Classes",
      desc: "US, Indian Demat, European, Crypto, Forex",
      icon: Globe,
      color: "text-purple-400",
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="launch-card rounded-3xl p-6 border border-white/[0.08] relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </span>
                    <div className={`p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                    {stat.value}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1">
                  <span className={`text-xs font-bold ${stat.color}`}>{stat.change}</span>
                  <p className="text-[11px] text-slate-400 leading-normal">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
