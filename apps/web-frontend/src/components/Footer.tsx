"use client";

import Link from "next/link";
import { TrendingUp, ShieldCheck, Github, Twitter, Disc as Discord, ArrowUpRight, Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#030611]/80 backdrop-blur-xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                SIRUS TRADING
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation multi-tenant quantitative algorithmic trading engine. Direct market access, vectorized sub-100ms backtesting, and automated risk orchestration across Equities & Crypto.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>All Systems Operational</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">Latency &lt; 4.2ms</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Terminal Dashboard <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/strategies" className="hover:text-cyan-400 transition-colors">
                  Strategy Engine
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-cyan-400 transition-colors">
                  Global Markets (120+)
                </Link>
              </li>
              <li>
                <Link href="/trades" className="hover:text-cyan-400 transition-colors">
                  Order Ledger & Audit
                </Link>
              </li>
              <li>
                <Link href="/settings/api-keys" className="hover:text-cyan-400 transition-colors">
                  Demat / Broker Linking
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Integrations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Supported Venues</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>Zerodha (Kite API)</span>
                <span className="text-[10px] text-amber-400 font-mono">NSE/BSE</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Alpaca Markets</span>
                <span className="text-[10px] text-cyan-400 font-mono">NASDAQ</span>
              </li>
              <li className="flex items-center justify-between">
                <span>KuCoin Spot/Futures</span>
                <span className="text-[10px] text-blue-400 font-mono">Crypto</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Interactive Brokers</span>
                <span className="text-[10px] text-rose-400 font-mono">Global</span>
              </li>
              <li className="flex items-center justify-between">
                <span>AngelOne SmartAPI</span>
                <span className="text-[10px] text-emerald-400 font-mono">Demat</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Security & Trust</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AES-256 Envelope Encryption. Zero plaintext credentials stored on disk. Isolated tenant sandboxing with pre-trade risk controls.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-slate-400">
              <span className="hover:text-white cursor-pointer transition-colors"><Twitter className="w-4 h-4" /></span>
              <span className="hover:text-white cursor-pointer transition-colors"><Github className="w-4 h-4" /></span>
              <span className="hover:text-white cursor-pointer transition-colors"><Discord className="w-4 h-4" /></span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} SIRUS Quantitative Technologies. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Whitepaper</span>
            <span className="hover:text-slate-400 cursor-pointer">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
