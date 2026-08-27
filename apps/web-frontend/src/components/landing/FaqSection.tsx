"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does SIRUS ensure the security of my broker & Demat API credentials?",
      a: "SIRUS uses AES-256-GCM envelope encryption where each tenant has an isolated cryptographic key. Plaintext credentials never touch disk storage or persistent logs; they are decrypted in ephemeral worker memory solely during order dispatch and discarded immediately.",
    },
    {
      q: "Which brokers and asset classes are natively supported?",
      a: "We currently support Zerodha Kite (NSE/BSE Demat), AngelOne SmartAPI, Upstox Pro, Groww, Alpaca Markets (US Equities & Fractional), Interactive Brokers (Global Equities & Options), and KuCoin Exchange (Crypto Spot & Derivatives). We continuously integrate new venues.",
    },
    {
      q: "Can I test my algorithms with realistic paper trading before deploying live capital?",
      a: "Yes! SIRUS includes a full paper trading sandbox that simulates live exchange execution, including slippage modeling, orderbook queues, and maker/taker fee structures across all 120+ supported instruments.",
    },
    {
      q: "How does the vectorized backtesting engine achieve sub-100ms execution?",
      a: "Our backtesting engine runs on a compiled vectorized C++/NumPy pipeline that batches and computes price actions over multi-core thread pools rather than iterating bar-by-bar, enabling continuous historical simulations across millions of ticks in milliseconds.",
    },
    {
      q: "What risk management guardrails are built into the platform?",
      a: "Pre-trade risk controls include maximum position sizing, automated portfolio drawdown limits, margin thresholds, trailing stop-losses, and kill-switch emergency cancellations across all linked brokers.",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full badge-glow-cyan text-xs font-semibold text-cyan-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked <span className="text-gradient-cyan">Questions</span>
          </h2>
          <p className="text-sm text-slate-400">
            Everything you need to know about our quantitative engine, broker connectivity, and execution security.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="launch-card rounded-2xl border border-white/[0.08] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors hover:bg-slate-900/40"
                >
                  <span className="text-sm sm:text-base font-bold text-white leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`p-2 rounded-xl bg-slate-900 border border-white/[0.06] text-cyan-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-cyan-500/10 border-cyan-500/30" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
