"use client";

import React from "react";
import { Zap, ShieldCheck, BarChart3, Globe } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      label: "Total Volume Executed",
      value: "$4.8B+",
      change: "+48% YoY",
      desc: "Routed across Equities & Crypto liquidity venues",
      icon: BarChart3,
      color: "text-[#fff800]",
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
      color: "text-cyan-400",
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
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="rounded-lg bg-[#0f1515]/70 backdrop-blur-[6px] p-6 border border-border relative overflow-hidden flex flex-col justify-between pricing-card-border"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </span>
                    <div className={`p-2 rounded-md bg-[#182222] border border-border ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-mono">
                    {stat.value}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  <span className={`text-xs font-semibold ${stat.color}`}>{stat.change}</span>
                  <p className="text-xs text-muted-foreground leading-normal">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
