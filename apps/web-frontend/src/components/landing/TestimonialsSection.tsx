"use client";

import React from "react";
import { Star } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-[32px] leading-[36px] md:text-[56px] md:leading-[60px] tracking-[-1.6px] font-medium text-white">
            Trusted by systematic traders worldwide.
          </h2>
          <p className="text-[16px] text-muted-foreground">
            Hear from fund managers, prop desks, and retail quantitative traders who rely on SIRUS daily.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-[#0f1515]/70 backdrop-blur-[6px] p-8 border border-border flex flex-col justify-between space-y-6 relative pricing-card-border"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#fff800] space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#fff800]" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-sm bg-[#182222] text-[#fff800] border border-border">
                    {t.highlight}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center space-x-3.5 pt-4 border-t border-border">
                <div className="w-9 h-9 rounded-md bg-[#182222] border border-border flex items-center justify-center font-bold text-white text-xs font-mono">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
