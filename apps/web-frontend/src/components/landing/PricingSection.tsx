"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Zap, Shield } from "lucide-react";

export default function PricingSection() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const tiers = [
    {
      name: "Starter Sandbox",
      monthlyPrice: "$0",
      annualPrice: "$0",
      period: "forever free",
      desc: "Ideal for retail quants evaluating strategies in paper trading environment.",
      popular: false,
      cta: "Launch Sandbox",
      href: "/dashboard",
      features: [
        "120+ Global Market Instruments",
        "Vectorized Backtesting Engine (1m, 5m, 1d)",
        "Paper Trading Execution Simulation",
        "Standard Algorithmic Primitives (MA, RSI, VWAP)",
        "Single Tenant Account",
        "Community Discord Support",
      ],
    },
    {
      name: "Pro Quant",
      monthlyPrice: "$49",
      annualPrice: "$39",
      period: "per month",
      desc: "For systematic traders requiring live DMA order execution and multi-broker sync.",
      popular: true,
      cta: "Start 14-Day Free Trial",
      href: "/login",
      features: [
        "Everything in Sandbox",
        "Live DMA Broker Routing (Zerodha, Alpaca, KuCoin, IBKR)",
        "Sub-100ms High Frequency Execution",
        "Unlimited Active Algorithmic Bots",
        "Dynamic No-Code AST & Python Strategy Canvas",
        "Pre-Trade Margin & Drawdown Risk Guard",
        "Real-Time Redis WebSocket Market Feeds",
        "Priority 24/7 Quant Support",
      ],
    },
    {
      name: "Institutional Desk",
      monthlyPrice: "$299",
      annualPrice: "$249",
      period: "per month",
      desc: "Designed for hedge funds, prop trading desks, and asset management teams.",
      popular: false,
      cta: "Contact Enterprise",
      href: "/login",
      features: [
        "Everything in Pro Quant",
        "Multi-Tenant Partitioned Subaccounts",
        "Custom FIX Protocol & Low-Latency Colocation",
        "Dedicated AES-256 HSM Vault Keys",
        "Custom Alpha Model Scripting Support",
        "99.99% Execution Uptime SLA",
        "Dedicated Account Engineer",
      ],
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950/30 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Simple Plans for <span className="text-gradient-cyan">Every Scale</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Start free with full backtesting and paper trading. Upgrade only when you're ready to deploy live capital.
          </p>

          {/* Billing Switch (Monthly / Annual) */}
          <div className="pt-4 flex items-center justify-center space-x-3">
            <span className={`text-xs font-semibold ${!annualBilling ? "text-white" : "text-slate-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-full bg-slate-900 border border-white/10 p-0.5 relative transition-colors focus:outline-none"
            >
              <div
                className={`w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md transition-transform duration-200 ${
                  annualBilling ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center space-x-1.5">
              <span className={`text-xs font-semibold ${annualBilling ? "text-white" : "text-slate-400"}`}>
                Annual Billing
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`launch-card rounded-3xl p-8 border flex flex-col justify-between relative transition-all duration-300 ${
                tier.popular
                  ? "border-cyan-500/50 bg-slate-900/80 shadow-2xl shadow-cyan-500/15 lg:-translate-y-2 ring-1 ring-cyan-500/30"
                  : "border-white/[0.08]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{tier.desc}</p>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                    {annualBilling ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/{tier.period}</span>
                </div>

                <Link
                  href={tier.href}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                    tier.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 ring-1 ring-white/20"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Features Included:</span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2.5">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
