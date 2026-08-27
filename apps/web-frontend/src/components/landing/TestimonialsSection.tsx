"use client";

import React from "react";
import { Star, ShieldCheck, Sparkles, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Head of Quantitative Research, Vance Capital",
      content:
        "SIRUS replaced our in-house order routing pipeline. The vectorized backtester runs in sub-100ms compared to minutes on our legacy stack, and execution latency through Alpaca DMA is razor-sharp.",
      avatar: "MV",
      highlight: "Sub-100ms Backtesting",
      rating: 5,
    },
    {
      name: "Ananya Sharma",
      role: "Systematic F&O Trader, Mumbai",
      content:
        "Connecting my Zerodha Kite Demat credentials was effortless. The pre-trade risk engine and AES-256 envelope vault give me complete confidence running automated momentum strategies during volatile market openings.",
      avatar: "AS",
      highlight: "Seamless Demat Sync",
      rating: 5,
    },
    {
      name: "Devon Chen",
      role: "Crypto Prop Fund Manager, Singapore",
      content:
        "The multi-tenant subaccount isolation is enterprise-grade. We manage multiple client accounts with dedicated risk profiles across KuCoin and Spot venues with zero state leakage.",
      avatar: "DC",
      highlight: "Multi-Tenant Isolation",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-glow-cyan text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wall of Quantitative Trust</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Trusted by <span className="text-gradient-cyan">Systematic Traders</span> Worldwide
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Hear from fund managers, prop desks, and retail quantitative traders who rely on SIRUS daily.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="launch-card rounded-3xl p-8 border border-white/[0.08] flex flex-col justify-between space-y-6 relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {t.highlight}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center space-x-3.5 pt-4 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs font-mono shadow-md">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
