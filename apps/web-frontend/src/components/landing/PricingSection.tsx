"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  const tiers = [
    {
      name: "Starter",
      monthlyPrice: "$0",
      annualPrice: "$0",
      period: "forever free",
      desc: "Ideal for individual quants evaluating strategies in a paper trading sandbox.",
      popular: false,
      cta: "Get started",
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
      desc: "Enhanced algorithmic execution for scaling traders who need live DMA & multi-broker routing.",
      popular: true,
      cta: "Get started",
      href: "/login",
      features: [
        "Everything in Starter",
        "Live DMA Broker Routing (Zerodha, Alpaca, KuCoin, IBKR)",
        "Sub-100ms High Frequency Execution",
        "Unlimited Active Algorithmic Bots",
        "Dynamic No-Code AST & Python Strategy Studio",
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
      desc: "Powerful multi-tenant tools designed for hedge funds, prop desks, and asset managers.",
      popular: false,
      cta: "Contact desk",
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
    <section className="mx-auto max-w-7xl px-6 md:px-8 py-20 relative flex flex-col items-center justify-between">
      {/* Header */}
      <div className="text-center w-full max-w-3xl mb-12">
        <h2 className="text-[36px] leading-[40px] md:text-[64px] md:leading-[68px] tracking-[-1.6px] font-medium text-white">
          Powerful trading tools.<br />Simple pricing.
        </h2>
        <p className="mt-4 text-[16px] leading-[24px] md:text-[18px] md:leading-[28px] text-muted-foreground">
          Plans for systematic traders of every size — from sandbox researchers to institutional desks.
        </p>
      </div>

      {/* Paddle Tab Switcher (Monthly / Annual) */}
      <div className="flex justify-center mb-12">
        <div role="tablist" aria-orientation="horizontal" className="inline-flex h-12 items-center gap-[6px] justify-center rounded-md bg-[#0f1515] px-[6px] py-[6px] text-muted-foreground border-border border">
          <button
            type="button"
            role="tab"
            aria-selected={billingPeriod === "monthly"}
            onClick={() => setBillingPeriod("monthly")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm h-9 px-4 text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-[#182222] text-foreground shadow-xs border border-border/60 font-semibold"
                : "hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billingPeriod === "annual"}
            onClick={() => setBillingPeriod("annual")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm h-9 px-4 text-sm font-medium transition-all ${
              billingPeriod === "annual"
                ? "bg-[#182222] text-foreground shadow-xs border border-border/60 font-semibold"
                : "hover:text-foreground"
            }`}
          >
            <span>Annual</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#fff800]/10 text-[#fff800] border border-[#fff800]/20">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Paddle 3-Tier Grid */}
      <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 w-full">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-[#0f1515]/70 backdrop-blur-[6px] overflow-hidden border border-border flex flex-col justify-between"
          >
            <div className="flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border relative">
              {/* Featured Neon Glows for Pro Tier */}
              {tier.popular && (
                <>
                  <div className="featured-yellow-highlight-bg" />
                  <div className="featured-hard-blur-bg" />
                  <div className="featured-vertical-hard-blur-bg" />
                  <div className="featured-soft-blur-bg" />
                </>
              )}

              <div className={`flex justify-between items-center px-8 pt-8 ${tier.popular ? "featured-price-title" : ""}`}>
                <div className="flex items-center gap-[10px]">
                  <div className="w-8 h-8 rounded-lg bg-[#182222] border border-border flex items-center justify-center text-xs font-bold text-white font-mono">
                    {tier.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-[20px] leading-[30px] font-semibold text-white">{tier.name}</p>
                </div>
                {tier.popular && (
                  <div className="flex items-center px-2.5 py-0.5 rounded-sm border border-secondary-foreground/10 text-[13px] font-medium featured-card-badge">
                    Most popular
                  </div>
                )}
              </div>

              {/* Price Display */}
              <div className="mt-4 flex flex-col px-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-[40px] md:text-[48px] font-bold tracking-tight text-white font-mono">
                    {billingPeriod === "annual" ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-sm text-muted-foreground font-normal">/{tier.period}</span>
                </div>
              </div>

              <div className="px-8">
                <div data-orientation="horizontal" role="none" className="shrink-0 h-[1px] w-full bg-border" />
              </div>

              <div className="px-8 text-[15px] leading-[24px] text-muted-foreground min-h-[48px]">
                {tier.desc}
              </div>
            </div>

            {/* CTA Button */}
            <div className="px-8 mt-6">
              <Link
                href={tier.href}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium cursor-pointer relative bg-[#fcfcfc33] text-white secondary-button-animation h-11 px-5 py-[10px] w-full border border-white/10 hover:bg-white/20"
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>

            {/* Feature Bullet List */}
            <ul className="p-8 flex flex-col gap-3.5 mt-2">
              {tier.features.map((feat, i) => (
                <li key={i} className="flex gap-x-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-[#fff800] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
