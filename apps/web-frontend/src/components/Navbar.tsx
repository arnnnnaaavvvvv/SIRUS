"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp,
  LayoutDashboard,
  Sliders,
  Globe,
  History,
  Link2,
  LogOut,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";

  const appNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Strategies", href: "/strategies", icon: Sliders },
    { label: "Markets", href: "/markets", icon: Globe },
    { label: "Trade Ledger", href: "/trades", icon: History },
    { label: "Linked Demat", href: "/settings/api-keys", icon: Link2 },
  ];

  const landingNavItems = [
    { label: "Features", href: "#features" },
    { label: "Simulator", href: "#simulator" },
    { label: "Markets", href: "/markets" },
    { label: "Strategies", href: "/strategies" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const formatDisplayEmail = (emailStr?: string) => {
    if (!emailStr) return "Trader Account";
    if (emailStr.includes("@")) {
      const [name, domain] = emailStr.split("@");
      return `${name.slice(0, 2)}••••@${domain}`;
    }
    return "Trader Account";
  };

  return (
    <header className="sticky top-0 z-50 launch-glass-nav backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                SIRUS
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> v2.4 DMA
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">Quantitative Engine</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-2xl border border-white/[0.06]">
          {isLanding
            ? landingNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  {item.label}
                </Link>
              ))
            : appNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">{formatDisplayEmail(user.email)}</span>
                <span className="text-[10px] text-cyan-400/90 font-mono">Tenant ID: ••••••••</span>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-white/10 transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5 ring-1 ring-white/20 hover:scale-[1.02]"
              >
                <span>Launch Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-white/[0.08]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3">
          <div className="space-y-1">
            {(isLanding ? landingNavItems : appNavItems).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{formatDisplayEmail(user.email)}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Tenant ID: ••••••••</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20"
                >
                  Launch Terminal
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
