"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/40 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden text-center space-y-6">
          {/* Ambient Glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to Automate Your <span className="text-gradient-cyan">Trading Edge</span>?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of quantitative traders leveraging vectorized backtesting, sub-millisecond execution, and automated Demat sync. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 ring-1 ring-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Terminal Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In with Demat / Google</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center space-x-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Vault</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> &lt; 5ms Routing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
