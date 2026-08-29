"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Github, Twitter, Disc as Discord, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#0f1515]">
      {/* Paddle Top Footer Glow Border */}
      <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full footer-border" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#182222] border border-border flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-[#fff800]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                SIRUS QUANTITATIVE
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Next-generation algorithmic trading engine. Direct market access, sub-100ms vectorized backtesting, and automated risk orchestration across Equities &amp; Crypto.
            </p>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                  Terminal Dashboard <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/strategies" className="hover:text-foreground transition-colors">
                  Strategy Engine
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-foreground transition-colors">
                  Global Markets (120+)
                </Link>
              </li>
              <li>
                <Link href="/trades" className="hover:text-foreground transition-colors">
                  Order Ledger &amp; Audit
                </Link>
              </li>
              <li>
                <Link href="/settings/api-keys" className="hover:text-foreground transition-colors">
                  Demat / Broker Linking
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Integrations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Supported Venues</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Zerodha (Kite API)</li>
              <li>Alpaca Markets</li>
              <li>KuCoin Spot &amp; Futures</li>
              <li>Interactive Brokers</li>
              <li>AngelOne SmartAPI</li>
            </ul>
          </div>

          {/* Col 4: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Security &amp; Trust</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AES-256 Envelope Encryption. Isolated tenant sandboxing with automated pre-trade risk controls.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-muted-foreground">
              <span className="hover:text-white cursor-pointer transition-colors p-1.5 rounded-md hover:bg-[#182222]"><Twitter className="w-4 h-4" /></span>
              <span className="hover:text-white cursor-pointer transition-colors p-1.5 rounded-md hover:bg-[#182222]"><Github className="w-4 h-4" /></span>
              <span className="hover:text-white cursor-pointer transition-colors p-1.5 rounded-md hover:bg-[#182222]"><Discord className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Paddle Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} SIRUS Quantitative Technologies. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Security Whitepaper</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
